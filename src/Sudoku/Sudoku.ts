import { Observable } from 'rxjs';
import SudokuCell from 'src/Sudoku/SudokuCell';

export const VALID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as [1, 2, 3, 4, 5, 6, 7, 8, 9];
export type ValidNumber = typeof VALID_NUMBERS[number]

export type MapValidsNumberTo<T> = {
    [K in ValidNumber]: T
}

export type SudokuGame = {
    cells: SudokuCell[];

    isEmpty$: Observable<boolean>;

    isValid$: Observable<boolean>;

    isSolved$: Observable<boolean>;
}
