import { applyTransform, getNormalizationCoefficients, QuadPoints } from 'src/GridFromImage/change-perspective';
import { findConnectedPixels, findCorners, findExtremities } from 'src/GridFromImage/EasyAnalyse';
import EasyCanvas from 'src/GridFromImage/EasyCanvas.js';
import { applyDarken, applyGreyscale, applyMask, applyThreshold, erode, padCanvas } from 'src/GridFromImage/EasyManipulate';
import { createCanvas, findLargest, range } from 'src/GridFromImage/Util';

/**
 * Configurables:
 *  - greyScale filter colour balance
 *  - threshold level
 *  - noise group size
 */
const NOISE_GROUP_SIZE = 10;

/**
 * We know what we are looking for is near the middle so we limit our search
 */
function intersectsWithCenter(w: number, h: number): [number, number] {
    const startOfMiddleRow = Math.floor(h / 2) * w;
    return [Math.floor(w * 0.25) + startOfMiddleRow, Math.floor(w * 0.75) + startOfMiddleRow];
}

// export async function extractGrid(image: HTMLImageElement) {
export function extractGrid(image: HTMLImageElement | HTMLCanvasElement) {
    const imgWidth = image.width;
    const imgHeight = image.height;

    // const original = new EasyCanvas(await createCanvas(imgWidth, imgHeight));
    const original = new EasyCanvas(createCanvas, imgWidth, imgHeight);
    original.fill('white');
    original.drawImage(image);

    // const working = original.clone(await createCanvas());
    const working = original.clone();

    applyThreshold(applyGreyscale(working));

    const pixelGroups = findConnectedPixels(working, 0);

    const intersectPixels = range(...intersectsWithCenter(imgWidth, imgHeight));

    const intersectingGroups = pixelGroups.filter(pixels => pixels.findIndex(pixel => intersectPixels.includes(pixel.i)) !== -1);

    const gridGroup = findLargest(intersectingGroups);

    const noise = pixelGroups.filter(group => group.length < NOISE_GROUP_SIZE).flat().concat(gridGroup);
    for (const pixel of noise) {
        pixel.setRGB(255);
    }

    const corners = findCorners(gridGroup);
    const extremities = findExtremities(working, corners);

    const srcCorners = corners.flatMap(corner => corner.xy) as QuadPoints;
    const destCorners = extremities.flatMap(extremity => extremity.xy) as QuadPoints;

    const transformer = createPerspectiveTransformer(srcCorners, destCorners);

    // const transformedWorking = await transformer(working);
    const transformedWorking = transformer(working);
    erode(transformedWorking);

    const digitGroups = findConnectedPixels(transformedWorking, 0);

    // const result = await transformer(original);
    const result = transformer(original);

    applyGreyscale(result);
    applyDarken(result);
    applyMask(result, digitGroups.flat().map(pixel => pixel.i));

    const cellWidth = result.w / 9;
    const cellHeight = result.h / 9;

    let maxDigitWidth = 0;
    let maxDigitHeight = 0;
    let heightSum = 0;

    // const digitCanvases = await Promise.all(digitGroups.map(async (group) => {
    const digitCanvases = digitGroups.map((group) => {
        const extremities = findExtremities(result, group);
        // const digitCanvas = result.crop(await createCanvas(), extremities[0], extremities[2]);
        const digitCanvas = result.crop(extremities[0], extremities[2]);

        const row = Math.floor(extremities[0].y / cellHeight);
        const col = Math.floor(extremities[0].x / cellWidth);

        maxDigitWidth = Math.max(maxDigitWidth, digitCanvas.w);
        maxDigitHeight = Math.max(maxDigitHeight, digitCanvas.h);
        heightSum += digitCanvas.h;

        const cellNumber = row * 9 + col;
        return [cellNumber, digitCanvas] as [number, EasyCanvas];
    });

    const meanHeight = Math.round(heightSum / digitGroups.length);
    console.log('file dimensions', maxDigitWidth, maxDigitHeight, 'font size', meanHeight);

    // return Promise.all(digitCanvases.map(async ([cellNumber, digitCanvas]) => [
    const extractDigits = digitCanvases.map(([cellNumber, digitCanvas]) => [
        cellNumber,
        // padCanvas(await createCanvas(maxDigitWidth, maxDigitHeight), digitCanvas)
        padCanvas(createCanvas, digitCanvas, maxDigitWidth, maxDigitHeight)
    ] as [number, EasyCanvas]);

    return [extractDigits, maxDigitWidth, maxDigitHeight, meanHeight] as [[number, EasyCanvas][], number, number, number];
}

function createPerspectiveTransformer(src: QuadPoints, dest: QuadPoints) {
    const coeffs = getNormalizationCoefficients(src, dest, false);

    const width = dest[2] - dest[0];
    const height = dest[5] - dest[1];

    const tlx = dest[0];
    const tly = dest[1];

    // return async (srcCanvas: EasyCanvas) => {
    return (srcCanvas: EasyCanvas) => {
        const resultCanvas = new EasyCanvas(createCanvas, width, height);
        // const resultCanvas = new EasyCanvas(await createCanvas(width, height));

        for (const pixel of resultCanvas.pixels) {
            const [sx, sy] = applyTransform(coeffs, pixel.x + tlx, pixel.y + tly);
            const srcPixel = srcCanvas.pixel(Math.round(sx), Math.round(sy));

            pixel.setRGB(srcPixel !== undefined ? srcPixel.rgb : 255);
            pixel.a = 255;
        }

        return resultCanvas;
    };
}
