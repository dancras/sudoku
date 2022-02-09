import { lastValueFrom } from 'rxjs';
import { peek } from 'src/RxPreact';
import GridCell from 'src/Sudoku/GridCell';
import GridSlice from 'src/Sudoku/GridSlice';
import SudokuCell from 'src/Sudoku/SudokuCell';

describe('GridSlice', () => {
    test('it exposes occurences of each valid number', () => {
        const cells = Array.from({ length: 9 }).map(() => new GridCell());
        const slice = new GridSlice(cells);

        expect(peek(slice.occurrences[1])).toEqual(0);
        expect(peek(slice.occurrences[2])).toEqual(0);
        expect(peek(slice.occurrences[3])).toEqual(0);

        cells[0].contents$.next(1);
        cells[1].contents$.next(1);
        cells[2].contents$.next(2);

        expect(peek(slice.occurrences[1])).toEqual(2);
        expect(peek(slice.occurrences[2])).toEqual(1);
        expect(peek(slice.occurrences[3])).toEqual(0);
    });
});

describe('SudokuCell', () => {

    let gridCells: GridCell[];
    let gridCell: GridCell;
    let gridSlice: GridSlice;
    let sudokuCell: SudokuCell;

    beforeEach(() => {
        gridCells = Array.from({ length: 9 }).map(() => new GridCell());
        gridCell = gridCells[0];
        gridSlice = new GridSlice(gridCells);
        sudokuCell = new SudokuCell(gridCell, [gridSlice], Promise.resolve());
    });

    test('contents$ is the value from underlying grid cell and whether it is valid', () => {
        gridCell.contents$.next(9);

        const sudokuCell = new SudokuCell(gridCell, [gridSlice], Promise.resolve());

        expect(peek(sudokuCell.contents$)).toEqual([9, true]);
    });

    test('contents$ is marked as invalid if GridSlice contains more than one of contents ', () => {

        gridCells[1].contents$.next(5);
        sudokuCell.toggleContents(5);

        const [value, isCorrect] = peek(sudokuCell.contents$) || [9, true];

        expect(value).toEqual(5);
        expect(isCorrect).toEqual(false);
    });

    test('contents$ is marked as invalid even if another GridSlice is valid ', () => {
        const cell = new SudokuCell(gridCell, [new GridSlice([gridCell]), gridSlice], Promise.resolve());

        gridCells[1].contents$.next(5);
        cell.toggleContents(5);

        const [value, isCorrect] = peek(cell.contents$) || [9, true];

        expect(value).toEqual(5);
        expect(isCorrect).toEqual(false);
    });

    test('toggleContents sets underlying grid contents when different to current', () => {
        sudokuCell.toggleContents(1);
        expect(peek(sudokuCell.contents$)).toEqual([1, true]);

        sudokuCell.toggleContents(5);
        expect(peek(sudokuCell.contents$)).toEqual([5, true]);

        sudokuCell.toggleContents(null);
        expect(peek(sudokuCell.contents$)).toEqual(null);
    });

    test('toggleContents nulls underlying grid contents when equal to current', () => {
        sudokuCell.toggleContents(1);
        expect(peek(sudokuCell.contents$)).toEqual([1, true]);

        sudokuCell.toggleContents(1);
        expect(peek(sudokuCell.contents$)).toEqual(null);
    });

    test('candidate is null for a value when the underlying grid cell is false', () => {
        expect(peek(sudokuCell.candidates[1])).toEqual(null);
    });

    test('candidate is valid when underlying cell has it showing and no slice contains it', () => {
        sudokuCell.toggleCandidate(1);

        expect(peek(sudokuCell.candidates[1])).toEqual(true);

        gridCells[1].contents$.next(1);

        expect(peek(sudokuCell.candidates[1])).toEqual(false);
    });

    test('toggleCandidates nulls underlying value when it is currently showing', () => {
        sudokuCell.toggleCandidate(1);
        expect(peek(sudokuCell.candidates[1])).toEqual(true);

        sudokuCell.toggleCandidate(1);
        expect(peek(sudokuCell.candidates[1])).toEqual(null);
    });

    test('isLocked$ is false while the locked promise is unresolved', () => {
        const sudokuCell = new SudokuCell(gridCell, [gridSlice], new Promise(() => void(0)));
        expect(peek(sudokuCell.isLocked$)).toEqual(false);
        expect(peek(sudokuCell.isLocked$)).toEqual(false);
        expect(peek(sudokuCell.isLocked$)).toEqual(false);
    });

    test('isLocked$ is false if the promise resolves when contents are null', async () => {
        const sudokuCell = new SudokuCell(gridCell, [gridSlice], Promise.resolve());

        expect(await lastValueFrom(sudokuCell.isLocked$)).toEqual(false);

        sudokuCell.toggleContents(1);

        expect(await lastValueFrom(sudokuCell.isLocked$)).toEqual(false);
    });

    test('isLocked$ is true if the promise resolves when contents are set', async () => {
        let deferred: () => void = () => void(0);
        const lock = new Promise<void>((resolve) => deferred = resolve);

        const sudokuCell = new SudokuCell(gridCell, [gridSlice], lock);

        sudokuCell.toggleContents(1);
        deferred();

        expect(await lastValueFrom(sudokuCell.isLocked$)).toEqual(true);

        sudokuCell.toggleContents(null);

        expect(await lastValueFrom(sudokuCell.isLocked$)).toEqual(true);
    });
});
