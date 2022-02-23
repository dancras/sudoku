import { findConnectedPixelGroups, findCorners, findExtremities, keepLargestGroup } from '#ocr/Contour.js';
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

loadImage(gridInputPath).then(gridImage => {
    const imgWidth = gridImage.width;
    const imgHeight = gridImage.height;
    const gridCanvas = createCanvas(imgWidth, imgHeight);
    const gridCtx = gridCanvas.getContext('2d');
    gridCtx.drawImage(gridImage, 0, 0);
    const origImgData = gridCtx.getImageData(0, 0, imgWidth, imgHeight);
    const imgData = gridCtx.getImageData(0, 0, imgWidth, imgHeight);
    applyThreshold(applyGreyscale(imgData));

    gridCtx.putImageData(imgData, 0, 0);
    fs.writeFileSync('ocr/find-puzzle-threshold.png', gridCanvas.toBuffer('image/png'));

    const pixelGroups = findConnectedPixelGroups(imgData, 0);
    const intersectPixels = range(...intersectsWithCenter(imgWidth, imgHeight));

    const intersectingGroups = pixelGroups.filter(group => group.findIndex(member => intersectPixels.includes(member)) !== -1);

    const gridGroup = keepLargestGroup(intersectingGroups);

    const noise = pixelGroups.filter(group => group.length < NOISE_GROUP_SIZE).flat().concat(gridGroup);
    for (let i of noise) {
        const j = i * 4;
        imgData.data[j] = imgData.data[j + 1] = imgData.data[j + 2] = 255;
    }

    gridCtx.putImageData(imgData, 0, 0);
    fs.writeFileSync('ocr/find-puzzle-no-grid.png', gridCanvas.toBuffer('image/png'));

    // TODO return coords clockwise
    const corners = findCorners(imgWidth, imgHeight, gridGroup);
    const extremities = findExtremities(corners, imgWidth);

    const topLeftExtremity = indexToCoordinate(extremities[0], imgWidth);
    const bottomRightExtremity = indexToCoordinate(extremities[1], imgWidth);

    const srcCorners = [
        ...indexToCoordinate(corners[0], imgWidth),
        ...indexToCoordinate(corners[1], imgWidth),
        ...indexToCoordinate(corners[3], imgWidth),
        ...indexToCoordinate(corners[2], imgWidth),
    ];

    const destCorners = [
        topLeftExtremity[0], topLeftExtremity[1],
        bottomRightExtremity[0], topLeftExtremity[1],
        bottomRightExtremity[0], bottomRightExtremity[1],
        topLeftExtremity[0], bottomRightExtremity[1]
    ];

    const coeffs = getNormalizationCoefficients(srcCorners, destCorners, false);

    const gridWidth = bottomRightExtremity[0] - topLeftExtremity[0];
    const gridHeight = bottomRightExtremity[1] - topLeftExtremity[1];

    const croppedCanvas = createTransformedCanvas(topLeftExtremity, bottomRightExtremity, coeffs, imgData);
    erode(croppedCanvas);
    const croppedCtx = croppedCanvas.getContext('2d');
    const croppedData = croppedCtx.getImageData(0, 0, gridWidth, gridHeight);

    fs.writeFileSync('ocr/find-puzzle-cropped.png', croppedCanvas.toBuffer('image/png'));

    const digitGroups = findConnectedPixelGroups(croppedData, 0);

    const resultCanvas = createTransformedCanvas(topLeftExtremity, bottomRightExtremity, coeffs, origImgData);
    const resultCtx = resultCanvas.getContext('2d');
    const resultData = resultCtx.getImageData(0, 0, gridWidth, gridHeight);

    applyGreyscale(resultData);
    applyDarken(resultData);
    applyMask(resultData, digitGroups.flat());

    resultCtx.putImageData(resultData, 0, 0);

    fs.writeFileSync('ocr/find-puzzle-result.png', resultCanvas.toBuffer('image/png'));

    const cellWidth = gridWidth / 9;
    const cellHeight = gridHeight / 9;
    const gridRow = cellHeight * gridWidth;

    let maxDigitWidth = 0;
    let maxDigitHeight = 0;
    let heightSum = 0;

    const digitCanvases = digitGroups.map((group) => {
        const digitCanvas = createCanvasFromGroup(group, resultData);
        const [topLeftIndex] = findExtremities(group, gridWidth);

        maxDigitWidth = Math.max(maxDigitWidth, digitCanvas.width);
        maxDigitHeight = Math.max(maxDigitHeight, digitCanvas.height);
        heightSum += digitCanvas.height;

        const row = Math.floor(topLeftIndex / gridRow);
        const col = Math.floor((topLeftIndex % gridWidth) / cellWidth);
        const cellNumber = row * 9 + col;
        return [cellNumber, digitCanvas];
    });

    const meanHeight = Math.round(heightSum / digitGroups.length);
    console.log('file dimensions', maxDigitWidth, maxDigitHeight, 'font size', meanHeight);

    digitCanvases.forEach(([cellNumber, digitCanvas]) => {
        const paddedCanvas = padCanvas(digitCanvas, maxDigitWidth, maxDigitHeight);
        fs.writeFileSync(`ocr/find-puzzle/cell_${cellNumber}.png`, paddedCanvas.toBuffer('image/png'));
    });
});

function createTransformedCanvas(topLeftExtremity, bottomRightExtremity, coeffs, srcData) {
    const srcWidth = srcData.width;
    const srcHeight = srcData.height;
    const gridWidth = bottomRightExtremity[0] - topLeftExtremity[0];
    const gridHeight = bottomRightExtremity[1] - topLeftExtremity[1];

    const c = createCanvas(gridWidth, gridHeight);
    const ctx = c.getContext('2d');
    const resultData = ctx.getImageData(0, 0, gridWidth, gridHeight);

    for (let i = 0; i < resultData.data.length; i += 4) {
        const [x, y] = indexToCoordinate(i / 4, gridWidth);
        const dx = topLeftExtremity[0] + x;
        const dy = topLeftExtremity[1] + y;
        const [sx, sy] = transformedCoordinate(coeffs, dx, dy);

        let pixel = 255;

        if (sx >= 0 && sx < srcWidth && sy >= 0 && sy < srcHeight) {
            const si = coordinateToIndex(Math.round(sx), Math.round(sy), srcWidth);
            pixel = srcData.data[si * 4];
        }

        resultData.data[i] = resultData.data[i + 1] = resultData.data[i + 2] = pixel;
        resultData.data[i + 3] = 255;
    }

    ctx.putImageData(resultData, 0, 0);
    return c;
}

function createCanvasFromGroup(group, groupImgData) {
    const [topLeftIndex, bottomRightIndex] = findExtremities(group, groupImgData.width);
    const topLeft = indexToCoordinate(topLeftIndex, groupImgData.width);
    const bottomRight = indexToCoordinate(bottomRightIndex, groupImgData.width);
    const w = bottomRight[0] - topLeft[0] + 1;
    const h = bottomRight[1] - topLeft[1] + 1;

    const c = createCanvas(w, h);
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);

    for (let member of group) {
        const coords = indexToCoordinate(member, groupImgData.width);
        const localCoords = [coords[0] - topLeft[0], coords[1] - topLeft[1]];
        const local = coordinateToIndex(...localCoords, w) * 4;
        const memberIndex = member * 4;
        imgData.data[local] = groupImgData.data[memberIndex];
        imgData.data[local + 1] = groupImgData.data[memberIndex + 1];
        imgData.data[local + 2] = groupImgData.data[memberIndex + 2];
    }

    ctx.putImageData(imgData, 0, 0);
    return c;
}

function indexToCoordinate(i, w) {
    const x = Math.floor(i % w);
    const y = Math.floor(i / w);
    return [x, y];
}

function coordinateToIndex(x, y, w) {
    return y * w + x;
}

function padCanvas(c, w, h) {
    const wdiff = w - c.width;
    const hdiff = h - c.height;
    const ctx = c.getContext('2d');
    const data = ctx.getImageData(0, 0, c.width, c.height);

    const paddedCanvas = createCanvas(w, h);
    const paddedCtx = paddedCanvas.getContext('2d');
    paddedCtx.fillStyle = 'white';
    paddedCtx.fillRect(0, 0, w, h);
    paddedCtx.putImageData(data, Math.round(wdiff / 2), Math.round(hdiff / 2));
    return paddedCanvas;
}

function applyMask(imgData, pixels) {
    const data = imgData.data;
    const pixelIndexes = pixels.map(p => p * 4);
    for (let i = 0; i < data.length; i += 4) {
        if (!pixelIndexes.includes(i)) {
            data[i] = data[i + 1] = data[i + 2] = 255;
        }
    }
    return imgData;
}

function erode(c) {
    const ctx = c.getContext('2d');
    const before = ctx.getImageData(0, 0, c.width, c.height);
    const result = ctx.getImageData(0, 0, c.width, c.height);
    const rowShift = c.width * 4;
    const data = result.data;

    for (let i = 0; i < before.data.length; i += 4) {
        if (before.data[i] === 0) {
            const prevRow = i - rowShift;
            const nextRow = i + rowShift;
            const prevCol = i - 4;
            const nextCol = i + 4;
            prevRow > 0 && (data[prevRow] = data[prevRow + 1] = data[prevRow + 2] = 0);
            prevCol > 0 && (data[prevCol] = data[prevCol + 1] = data[prevCol + 2] = 0);
            nextCol < before.data.length && (data[nextCol] = data[nextCol + 1] = data[nextCol + 2] = 0);
            nextRow > 0 && (data[nextRow] = data[nextRow + 1] = data[nextRow + 2] = 0);
        }
    }

    ctx.putImageData(result, 0, 0);
}

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
}

function applyDarken(imgData) {
    const data = imgData.data;
    let darkest = 255;

    for (let i = 0; i < data.length; i += 4) {
        darkest = Math.min(darkest, data[i]);
    }

    const lighestDiff = 255 - darkest;

    for (let i = 0; i < data.length; i += 4) {
        const diff = data[i] - darkest;
        const darkness = easeInOutCubic(1 - (diff / lighestDiff));
        data[i] = data[i + 1] = data[i + 2] = data[i] - Math.round(darkest * darkness);
    }
    return imgData;
}

function applyGreyscale(imgData) {
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = data.slice(i, i + 3);
        // CIE luminance
        // const greyLevel = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const greyLevel = 0.30 * r + 0.30 * g + 0.40 * b;
        data[i] = data[i + 1] = data[i + 2] = greyLevel;
    }
    return imgData;
}

function applyThreshold(imgData) {
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const onOrOff = r < 126 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = onOrOff;
    }
    return imgData;
}
