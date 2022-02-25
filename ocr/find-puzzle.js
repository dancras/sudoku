import { findConnectedPixels, findCorners, findExtremities } from '#ocr/EasyAnalyse.js';
import EasyCanvas from '#ocr/EasyCanvas.js';
import { applyDarken, applyGreyscale, applyMask, applyThreshold, erode, padCanvas } from '#ocr/EasyManipulate.js';
import { getNormalizationCoefficients, transformedCoordinate } from '#ocr/perspective.js';
import fs from 'fs';
import canvas from 'node-canvas';

const { createCanvas, loadImage } = canvas;

const gridInputPath = 'ocr/sudoku_grid.jpeg';
// const gridInputPath = 'ocr/sudoku_grid_02.png';
// const gridInputPath = 'ocr/sudoku_grid_02.jpg';

/**
 * Configurables:
 *  - greyScale filter colour balance
 *  - threshold level
 *  - noise group size
 */
const NOISE_GROUP_SIZE = 10;

/**
 * We know what we are looking for is near the middle so we limit our search
 *
 * @param number w
 * @param number h
 * @returns [number, number]
 */
function intersectsWithCenter(w, h) {
    const startOfMiddleRow = Math.floor(h / 2) * w;
    return [Math.floor(w * 0.25) + startOfMiddleRow, Math.floor(w * 0.75) + startOfMiddleRow];
}

function range(start, end) {
    return Array.from({ length: end - start }).map((x, i) => start + i);
}

function findLargest(array2D) {
    let largest = [];
    for (let array of array2D) {
        if (array.length > largest.length) {
            largest = array;
        }
    }
    return largest;
}

loadImage(gridInputPath).then(gridImage => {
    const imgWidth = gridImage.width;
    const imgHeight = gridImage.height;

    const original = new EasyCanvas(createCanvas, imgWidth, imgHeight);
    original.drawImage(gridImage);

    const working = original.clone();

    applyThreshold(applyGreyscale(working));

    fs.writeFileSync('ocr/find-puzzle/01-threshold.png', working.canvas.toBuffer('image/png'));

    const pixelGroups = findConnectedPixels(working, 0);

    const intersectPixels = range(...intersectsWithCenter(imgWidth, imgHeight));

    const intersectingGroups = pixelGroups.filter(pixels => pixels.findIndex(pixel => intersectPixels.includes(pixel.i)) !== -1);

    const gridGroup = findLargest(intersectingGroups);

    const noise = pixelGroups.filter(group => group.length < NOISE_GROUP_SIZE).flat().concat(gridGroup);
    for (let pixel of noise) {
        pixel.rgb = 255;
    }

    fs.writeFileSync('ocr/find-puzzle/02-clear-noise.png', working.canvas.toBuffer('image/png'));

    const corners = findCorners(gridGroup);
    const extremities = findExtremities(working, corners);

    const srcCorners = corners.flatMap(corner => corner.xy);
    const destCorners = extremities.flatMap(extremity => extremity.xy);

    const transformer = createPerspectiveTransformer(srcCorners, destCorners);

    const transformedWorking = transformer(working);
    erode(transformedWorking);

    fs.writeFileSync('ocr/find-puzzle/03-transform-erode.png', transformedWorking.canvas.toBuffer('image/png'));

    const digitGroups = findConnectedPixels(transformedWorking, 0);

    const result = transformer(original);

    applyGreyscale(result);
    applyDarken(result);
    applyMask(result, digitGroups.flat().map(pixel => pixel.i));

    fs.writeFileSync('ocr/find-puzzle/04-final-result.png', result.canvas.toBuffer('image/png'));

    const cellWidth = result.w / 9;
    const cellHeight = result.h / 9;

    let maxDigitWidth = 0;
    let maxDigitHeight = 0;
    let heightSum = 0;

    const digitCanvases = digitGroups.map((group) => {
        const extremities = findExtremities(result, group);
        const digitCanvas = result.crop(extremities[0], extremities[2]);

        const row = Math.floor(extremities[0].y / cellHeight);
        const col = Math.floor(extremities[0].x / cellWidth);

        maxDigitWidth = Math.max(maxDigitWidth, digitCanvas.w);
        maxDigitHeight = Math.max(maxDigitHeight, digitCanvas.h);
        heightSum += digitCanvas.h;

        const cellNumber = row * 9 + col;
        return [cellNumber, digitCanvas];
    });

    const meanHeight = Math.round(heightSum / digitGroups.length);
    console.log('file dimensions', maxDigitWidth, maxDigitHeight, 'font size', meanHeight);

    digitCanvases.forEach(([cellNumber, digitCanvas]) => {
        const paddedCanvas = padCanvas(createCanvas, digitCanvas, maxDigitWidth, maxDigitHeight);
        fs.writeFileSync(`ocr/find-puzzle/cell_${cellNumber}.png`, paddedCanvas.canvas.toBuffer('image/png'));
    });
});

function createPerspectiveTransformer(src, dest) {
    const coeffs = getNormalizationCoefficients(src, dest, false);

    const width = dest[2] - dest[0];
    const height = dest[5] - dest[1];

    const tlx = dest[0];
    const tly = dest[1];

    return (srcCanvas) => {
        const resultCanvas = new EasyCanvas(createCanvas, width, height);

        for (let pixel of resultCanvas.pixels) {
            const [sx, sy] = transformedCoordinate(coeffs, pixel.x + tlx, pixel.y + tly);
            const srcPixel = srcCanvas.pixel(Math.round(sx), Math.round(sy));

            pixel.rgb = srcPixel !== undefined ? srcPixel.rgb : 255;
            pixel.a = 255;
        }

        return resultCanvas;
    };
}
