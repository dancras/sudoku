import { Observable } from 'rxjs';
import { SudokuGame } from 'src/Sudoku';
import DefaultApp from 'src/SudokuApp/DefaultApp';

export enum SudokuGameStatus {
    Creating,
    Solving,
    Solved
}

export type SudokuApp = {
    status$: Observable<SudokuGameStatus>
    game$: Observable<SudokuGame>
    canStart$: Observable<boolean>
    startGame(): void;
}

export function createSudokuApp() {
    return new DefaultApp();
}
