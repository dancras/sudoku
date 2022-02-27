import { analyseDigits } from 'src/GridFromImage/AnalyseDigits';
import { extractGrid } from 'src/GridFromImage/ExtractGrid';
import { SudokuGameContents, ValidNumber } from 'src/Sudoku';

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
