import { analyseDigits } from 'src/GridFromImage/AnalyseDigits';
import { extractGrid } from 'src/GridFromImage/ExtractGrid';
import { SudokuGameContents, ValidNumber } from 'src/Sudoku';

const IMAGE_MAX_WIDTH = 600;

export type GridFromImageProgress = {
    step: string
};

export async function extractGridFromImage(
    image: HTMLImageElement | HTMLCanvasElement,
    onProgress: (progress: GridFromImageProgress) => Promise<void>
): Promise<SudokuGameContents> {
    const [extractedDigits, width, height, fontHeight] = await extractGrid(image, onProgress);

    const testSet = extractedDigits.map(d => d[1].canvas);
    const testResults = await analyseDigits(width, height, fontHeight, testSet, onProgress) as ValidNumber[];

    const sudokuContents = Array.from<ValidNumber | null>({ length: 81 }).fill(null);

    extractedDigits.forEach(([cellNumber], i) => {
        sudokuContents[cellNumber] = testResults[i];
    });

    return Promise.resolve(sudokuContents);
}

export function createCanvasFromFile(file: File) {
    return new Promise<HTMLCanvasElement>((resolve) => {
        const img = new Image();
        img.onload = function () {
            const resize = document.createElement('canvas');
            const resizeFactor = IMAGE_MAX_WIDTH / img.width;
            resize.width = IMAGE_MAX_WIDTH;
            resize.height = img.height * resizeFactor;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const ctx = resize.getContext('2d')!;
            ctx.drawImage(img, 0, 0, resize.width, resize.height);
            URL.revokeObjectURL(img.src);
            resolve(resize);
        };
        img.src = URL.createObjectURL(file);
    });
}
