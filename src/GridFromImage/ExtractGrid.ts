import { tuple } from 'src/Foundations';
import { GridFromImageProgress } from 'src/GridFromImage';
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

export async function extractGrid(
    image: HTMLImageElement | HTMLCanvasElement,
    onProgress: (progress: GridFromImageProgress) => Promise<void>
) {
    await onProgress({ step: 'Preparing image' });
    const imgWidth = image.width;
    const imgHeight = image.height;

    const original = new EasyCanvas(createCanvas, imgWidth, imgHeight);
    original.fill('white');
    original.drawImage(image);

    const working = original.clone();

    await onProgress({ step: 'Applying Filters' });

    applyThreshold(applyGreyscale(working));

    await onProgress({ step: 'Finding Connected Pixels' });
    const pixelGroups = findConnectedPixels(working, 0);

    await onProgress({ step: 'Finding Grid' });
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

    await onProgress({ step: 'Transforming Grid Perspective' });
    const transformedWorking = transformer(working);
    erode(transformedWorking);

    await onProgress({ step: 'Finding Digits' });
    const digitGroups = findConnectedPixels(transformedWorking, 0);

    await onProgress({ step: 'Transforming Perspective Again' });
    const result = transformer(original);

    await onProgress({ step: 'Applying Filters Again' });
    applyGreyscale(result);
    applyDarken(result);

    await onProgress({ step: 'Applying Digit Mask' });
    applyMask(result, digitGroups.flat().map(pixel => pixel.i));

    const cellWidth = result.w / 9;
    const cellHeight = result.h / 9;

    let maxDigitWidth = 0;
    let maxDigitHeight = 0;
    let heightSum = 0;

    await onProgress({ step: 'Creating Digit Canvases' });
    const digitCanvases = digitGroups.map((group) => {
        const extremities = findExtremities(result, group);
        const digitCanvas = result.crop(extremities[0], extremities[2]);

        const row = Math.floor(extremities[0].y / cellHeight);
        const col = Math.floor(extremities[0].x / cellWidth);

        maxDigitWidth = Math.max(maxDigitWidth, digitCanvas.w);
        maxDigitHeight = Math.max(maxDigitHeight, digitCanvas.h);
        heightSum += digitCanvas.h;

        const cellNumber = row * 9 + col;
        return tuple(cellNumber, digitCanvas);
    });

    await onProgress({ step: 'Padding Canvases' });
    const meanHeight = Math.round(heightSum / digitGroups.length);

    const extractDigits = digitCanvases.map(([cellNumber, digitCanvas]) => tuple(
        cellNumber,
        padCanvas(createCanvas, digitCanvas, maxDigitWidth, maxDigitHeight)
    ));

    return tuple(extractDigits, maxDigitWidth, maxDigitHeight, meanHeight);
}

function createPerspectiveTransformer(src: QuadPoints, dest: QuadPoints) {
    const coeffs = getNormalizationCoefficients(src, dest, false);

    const width = dest[2] - dest[0];
    const height = dest[5] - dest[1];

    const tlx = dest[0];
    const tly = dest[1];

    return (srcCanvas: EasyCanvas) => {
        const resultCanvas = new EasyCanvas(createCanvas, width, height);

        for (const pixel of resultCanvas.pixels) {
            const [sx, sy] = applyTransform(coeffs, pixel.x + tlx, pixel.y + tly);
            const srcPixel = srcCanvas.pixel(Math.round(sx), Math.round(sy));

            pixel.setRGB(srcPixel !== undefined ? srcPixel.rgb : 255);
            pixel.a = 255;
        }

        return resultCanvas;
    };
}
