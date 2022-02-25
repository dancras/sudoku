import fs from 'fs';
import KNN from 'ml-knn';
import canvas from 'node-canvas';

const { createCanvas, loadImage } = canvas;

// Try dilate pass with randomness

// context.font="italic small-caps bold 12px arial";

// const width = 26;
// const height = 35;
// const fontHeights = [33, 32, 31, 30];
// console.log('CORRECT', [
//     '9', '5', '8', '7', '9', '4',
//     '1', '9', '2', '6', '3', '5',
//     '1', '6', '8', '3', '7', '1',
//     '2', '4', '2', '9', '5', '1',
//     '3', '2', '8', '3', '5', '1'
// ]);

const width = 19;
const height = 23;
const fontHeights = [22, 21, 20, 19];
console.log('CORRECT', [
    '8', '5', '8', '7', '1', '4',
    '9', '7', '6', '7', '1', '2',
    '5', '8', '1', '6', '1', '7',
    '1', '5', '2', '9', '7', '4',
    '6', '8', '3', '9', '4', '3',
    '5', '9', '8'
]);

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const fonts = [
    'Andale Mono',
    'Arial',
    'Cambria',
    'Comic Sans MS',
    'Courier',
    'Impact',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
];
const styles = ['bold', ''];

let digitCanvases = [];

for (let digit of digits) {
    for (let font of fonts) {
        for (let style of styles) {
            for (let fontHeight of fontHeights) {
                const c = createCanvas(width, height);
                const ctx = c.getContext('2d');
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

                digitCanvases.push([c, digit]);
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
]);

const c = createCanvas(width * 10, Math.ceil(digitCanvases.length / 10) * height);
const ctx = c.getContext('2d');

for (let i in digitCanvases) {
    const [digitCanvas] = digitCanvases[i];
    const digitCtx = digitCanvas.getContext('2d');
    const digitData = digitCtx.getImageData(0, 0, width, height);

    const x = (i % 10) * width;
    const y = Math.floor(i / 10) * height;
    ctx.putImageData(digitData, x, y);
}

fs.writeFileSync('ocr/analyse-digits/digit.png', c.toBuffer('image/png'));

const trainingLabels = digitCanvases.map(x => x[1]);
const trainingData = digitCanvases.map(x => createDataFromCanvas(x[0]));

const knn = new KNN(trainingData, trainingLabels);
const cellPaths = fs.readdirSync('ocr/find-puzzle/')
    .filter(fileName => fileName.indexOf('cell_') === 0)
    .map(fileName => `ocr/find-puzzle/${fileName}`);

// console.log(cellPaths);

Promise.all(cellPaths.map(loadImage)).then(images => {
    const testData = images.map(createDataFromImage);

    console.log(knn.predict(testData));
});

function shiftCanvas(origCanvas, x, y) {
    const origCtx = origCanvas.getContext('2d');
    const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);

    const shiftCanvas = createCanvas(origCanvas.width, origCanvas.height);
    const shiftCtx = shiftCanvas.getContext('2d');
    shiftCtx.fillStyle = 'white';
    shiftCtx.fillRect(0, 0, origCanvas.width, origCanvas.height);
    shiftCtx.putImageData(origData, x, y);
    return shiftCanvas;
}

function createDataFromImage(image) {
    const imageCanvas = createCanvas(image.width, image.height);
    const imageCtx = imageCanvas.getContext('2d');
    imageCtx.drawImage(image, 0, 0);

    return createDataFromCanvas(imageCanvas);
}

function createDataFromCanvas(digitCanvas) {
    const digitCtx = digitCanvas.getContext('2d');
    const digitData = digitCtx.getImageData(0, 0, width, height);
    const pixels = [];

    for (let i = 0; i < digitData.data.length; i += 4) {
        pixels.push(digitData.data[i]);
    }

    return pixels;
}

function calculateFontSize(ctx, style, font, fontHeight) {
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
