import KNN from 'ml-knn';
import { createCanvas } from 'src/GridFromImage/Util';

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const fonts = [
    'Andale Mono, Menlo',
    'Arial',
    'Cambria, Gill Sans',
    'Comic Sans MS, Chalkboard SE',
    'Courier',
    'Impact, Avenir Next Condensed',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
];
const styles = ['bold', ''];

export function analyseDigits(
    width: number, height: number, meanFontHeight: number, testSet: HTMLCanvasElement[]
) {
    const fontHeights = [meanFontHeight, meanFontHeight - 1, meanFontHeight - 2, meanFontHeight - 3];

    let digitCanvases: [HTMLCanvasElement, number][] = [];

    for (const digit of digits) {
        for (const font of fonts) {
            for (const style of styles) {
                for (const fontHeight of fontHeights) {
                    const c = createCanvas(width, height);
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const ctx = c.getContext('2d')!;
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, width, height);
                    ctx.fillStyle = 'black';
                    const fontSize = calculateFontSize(ctx, style, font, fontHeight);
                    ctx.font = `${style} ${fontSize}px ${font}`;
                    const measurements = ctx.measureText(digit);
                    const renderedWidth = measurements.actualBoundingBoxLeft + measurements.actualBoundingBoxRight;
                    const x = measurements.actualBoundingBoxLeft + Math.round((width - renderedWidth) / 2);
                    const heightPad = Math.round((height - fontHeight) / 2);
                    ctx.fillText(digit, x, height - heightPad);

                    digitCanvases.push([c, parseInt(digit, 10)]);
                }
            }
        }
    }

    digitCanvases = digitCanvases.flatMap(([originalCanvas, i]) => [
        [originalCanvas, i],
        [shiftCanvas(originalCanvas, 1, 0), i],
        [shiftCanvas(originalCanvas, -1, 0), i],
        [shiftCanvas(originalCanvas, 0, 1), i],
        [shiftCanvas(originalCanvas, 0, -1), i]
    ] as [HTMLCanvasElement, number][]);

    // renderTrainingSet(digitCanvases);

    const trainingLabels = digitCanvases.map(x => x[1]);
    const trainingData = digitCanvases.map(x => createDataFromCanvas(x[0]));

    const knn = new KNN(trainingData, trainingLabels);

    const testData = testSet.map(createDataFromCanvas);

    return knn.predict(testData);
}

function shiftCanvas(origCanvas: HTMLCanvasElement, x: number, y: number) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const origCtx = origCanvas.getContext('2d')!;
    const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);

    const shiftCanvas = createCanvas(origCanvas.width, origCanvas.height);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shiftCtx = shiftCanvas.getContext('2d')!;
    shiftCtx.fillStyle = 'white';
    shiftCtx.fillRect(0, 0, origCanvas.width, origCanvas.height);
    shiftCtx.putImageData(origData, x, y);
    return shiftCanvas;
}

function createDataFromCanvas(digitCanvas: HTMLCanvasElement) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const digitCtx = digitCanvas.getContext('2d')!;
    const digitData = digitCtx.getImageData(0, 0, digitCanvas.width, digitCanvas.height);
    const pixels = [];

    for (let i = 0; i < digitData.data.length; i += 4) {
        pixels.push(digitData.data[i]);
    }

    return pixels;
}

function calculateFontSize(ctx: CanvasRenderingContext2D, style: string, font: string, fontHeight: number) {
    let fontSize = fontHeight;
    let renderedFontHeight = 0;

    while (renderedFontHeight < fontHeight) {
        ctx.font = `${style} ${fontSize}px ${font}`;
        const measurements = ctx.measureText('8');

        renderedFontHeight = measurements.actualBoundingBoxAscent;

        if (renderedFontHeight < fontHeight) {
            fontSize++;
        }
    }

    return fontSize;
}

// For debugging
function renderTrainingSet(digitCanvases: [HTMLCanvasElement, number][]) {
    const width = digitCanvases[0][0].width;
    const height = digitCanvases[0][0].height;

    const c = createCanvas(width * 10, Math.ceil(digitCanvases.length / 10) * height);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = c.getContext('2d')!;

    for (const i in digitCanvases) {
        const [digitCanvas] = digitCanvases[i];
        const j = parseInt(i, 10);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const digitCtx = digitCanvas.getContext('2d')!;
        const digitData = digitCtx.getImageData(0, 0, width, height);

        const x = (j % 10) * width;
        const y = Math.floor(j / 10) * height;
        ctx.putImageData(digitData, x, y);
    }
    document.body.appendChild(c);
}
