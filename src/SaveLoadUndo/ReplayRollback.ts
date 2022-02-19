import { ManagedUpdate } from 'src/SaveLoadUndo';
import { SudokuGame, SudokuGameUpdate, ValidNumber } from 'src/Sudoku';
import { SudokuApp, SudokuAppUpdate } from 'src/SudokuApp';

export function replayUpdate(app: SudokuApp, game: SudokuGame, update: ManagedUpdate) {

    switch (update.type) {
        case 'AppUpdate':
            replayAppUpdate(app, update.detail);
            break;
        case 'GridUpdate':
            replayGridUpdate(game, update.detail);
            break;
        default:
            console.error('Unhandled replayUpdate', ((x: never) => x)(update));
    }

}

function replayAppUpdate(app: SudokuApp, update: SudokuAppUpdate) {
    switch (update.type) {
        case 'LoadGameUpdate':
            app.loadGame(update.contents);
            break;
        case 'NewGameUpdate':
            app.newGame();
            break;
        case 'ResetGameUpdate':
            app.resetGame();
            break;
        case 'StartGameUpdate':
            app.startGame();
            break;
        default:
            console.error('Unhandled replayAppUpdate', ((x: never) => x)(update));
    }
}

function replayGridUpdate(game: SudokuGame, update: SudokuGameUpdate) {
    switch (update.type) {
        case 'CellUpdate':
            game.cells[update.cellIndex].toggleContents(update.contents);
            break;
        case 'CandidateUpdate':
            game.cells[update.cellIndex].toggleCandidate(update.candidate);
            break;
        default:
            console.error('Unhandled replayGridUpdate', ((x: never) => x)(update));
    }
}

export function rollbackUpdate(app: SudokuApp, game: SudokuGame, updates: ManagedUpdate[], update: ManagedUpdate) {
    switch (update.type) {
        case 'AppUpdate':
            break;
        case 'GridUpdate':
            rollbackGridUpdate(game, updates, update.detail);
            break;
        default:
            console.error('Unhandled rollbackUpdate', ((x: never) => x)(update));
    }
}

function rollbackGridUpdate(game: SudokuGame, updates: ManagedUpdate[], update: SudokuGameUpdate) {
    switch (update.type) {
        case 'CellUpdate':
            rollbackCellUpdate(game, updates, update.cellIndex);
            break;
        case 'CandidateUpdate':
            game.cells[update.cellIndex].toggleCandidate(update.candidate);
            break;
        default:
            console.error('Unhandled replayGridUpdate', ((x: never) => x)(update));
    }
}

function rollbackCellUpdate(game: SudokuGame, updates: ManagedUpdate[], cellIndex: number) {
    const reversedUpdates = [...updates].reverse();
    const i = reversedUpdates.findIndex(update => update.type === 'AppUpdate' || isCellUpdateForIndex(update, cellIndex));
    const update = reversedUpdates[i] as ManagedUpdate | undefined;

    let rollbackContents: ValidNumber | null = null;

    if (update && update.type === 'GridUpdate' && update.detail.type === 'CellUpdate') {
        rollbackContents = update.detail.contents;
    } else if (update && update.type === 'AppUpdate' && update.detail.type === 'LoadGameUpdate') {
        rollbackContents = update.detail.contents[cellIndex];
    }

    game.cells[cellIndex].toggleContents(rollbackContents);
}

function isCellUpdateForIndex(update: ManagedUpdate, cellIndex: number) {
    return update.type === 'GridUpdate' &&
        update.detail.type === 'CellUpdate' &&
        update.detail.cellIndex === cellIndex;
}
