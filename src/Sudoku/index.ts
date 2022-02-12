import { Observable } from 'rxjs';
import StandardSudokuGame from 'src/Sudoku/StandardSudokuGame';

export const VALID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as [1, 2, 3, 4, 5, 6, 7, 8, 9];
export type ValidNumber = typeof VALID_NUMBERS[number]

export type MapValidsNumberTo<T> = {
    [K in ValidNumber]: T
}

export type SudokuGameUpdate = {
    type: 'CellUpdate',
    cellIndex: number,
    contents: ValidNumber | null
} | {
    type: 'CandidateUpdate',
    cellIndex: number,
    candidate: ValidNumber,
    isShowing: boolean
};

export type SudokuGame = {
    cells: SudokuCell[];

    isEmpty$: Observable<boolean>;

    isValid$: Observable<boolean>;

    isSolved$: Observable<boolean>;

    getContents(): Array<ValidNumber | null>;

    updates$: Observable<SudokuGameUpdate>;
}

export type Answer = [ValidNumber, boolean];

export type SudokuCell = {
    contents$: Observable<Answer | null>;
    candidates: MapValidsNumberTo<Observable<boolean | null>>;
    isLocked: boolean;
    toggleContents(contents: ValidNumber | null): void;
    toggleCandidate(candidate: ValidNumber): void;
}

export function createSudokuGame(defaultContents?: Array<ValidNumber | null>): SudokuGame {
    return new StandardSudokuGame(defaultContents);
}
