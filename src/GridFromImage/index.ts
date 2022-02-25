import { analyseDigits } from 'src/GridFromImage/AnalyseDigits';
import { extractGrid } from 'src/GridFromImage/ExtractGrid';
import { SudokuGameContents, ValidNumber } from 'src/Sudoku';

export type GridFromImageProgress = {
    step: 'unknown'
};

export async function extractGridFromImage(
    image: HTMLImageElement | HTMLCanvasElement,
    onProgress: (progress: GridFromImageProgress) => void
): Promise<SudokuGameContents> {
    const [extractedDigits, width, height, fontHeight] = extractGrid(image);
    const testSet = extractedDigits.map(d => d[1].canvas);
    const testResults = analyseDigits(width, height, fontHeight, testSet) as ValidNumber[];

    const sudokuContents = Array.from<ValidNumber | null>({ length: 81 }).fill(null);

    extractedDigits.forEach(([cellNumber], i) => {
        sudokuContents[cellNumber] = testResults[i];
    });

    return Promise.resolve(sudokuContents);
}
