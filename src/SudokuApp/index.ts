import { Observable } from 'rxjs';
import { SudokuGame, SudokuGameContents } from 'src/Sudoku';
import DefaultApp from 'src/SudokuApp/DefaultApp';

export enum SudokuGameStatus {
    Creating,
    Solving,
    Solved
}

export type SudokuAppUpdate = {
    type: 'StartGameUpdate'
} | {
    type: 'NewGameUpdate'
} | {
    type: 'ResetGameUpdate'
} | {
    type: 'LoadGameUpdate',
    contents: SudokuGameContents
};

export type SudokuApp = {
    status$: Observable<SudokuGameStatus>
    game$: Observable<SudokuGame>
    canStart$: Observable<boolean>
    canReset$: Observable<boolean>
    updates$: Observable<SudokuAppUpdate>
    startGame(): void
    newGame(): void
    resetGame(): void
    loadGame(contents: SudokuGameContents): void
}

export function createSudokuApp() {
    return new DefaultApp();
}
