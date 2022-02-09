import { Observable } from 'rxjs';

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

export type Answer = [ValidNumber, boolean];

export type SudokuCell = {
    contents$: Observable<Answer | null>;
    candidates: MapValidsNumberTo<Observable<boolean | null>>;
    isLocked$: Observable<boolean>;
    toggleContents(contents: ValidNumber | null): void;
    toggleCandidate(candidate: ValidNumber): void;
}