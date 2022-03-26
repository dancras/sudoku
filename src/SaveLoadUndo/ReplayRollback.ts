import { of, withLatestFrom } from 'rxjs';
import { ManagedUpdate } from 'src/SaveLoadUndo/ManagedUpdate';
import { SudokuGame, SudokuGameUpdate } from 'src/Sudoku';
import { SudokuApp, SudokuAppUpdate } from 'src/SudokuApp';


/**
 * Use this to update app state with the effects of a list of updates
 */
export function replayUpdates(app: SudokuApp, updates: ManagedUpdate[]) {
    of(...updates).pipe(
        withLatestFrom(app.game$)
    ).subscribe(([update, game]) => {
        replayUpdate(app, game, update);
    });
}


/**
 * Prefer replayUpdates() where possible.
 *
 * @param game      | Note: app.game$ may update during rollback and this will be out of sync
 */
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
            app.loadGame(update.contents, update.startGame);
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
            game.cells[update.cellIndex].toggleCandidate(update.candidate, update.color);
            break;
        default:
            console.error('Unhandled replayGridUpdate', ((x: never) => x)(update));
    }
}


/**
 * Use this to restore the app state to how it was before provided update.
 *
 * @param updates   | Should not include the update being rolled back
 * @param game      | Note: app.game$ may update during rollback and this will be out of sync
 */
export function rollbackUpdate(app: SudokuApp, game: SudokuGame, updates: ManagedUpdate[], update: ManagedUpdate) {
    switch (update.type) {
        case 'AppUpdate':
            rollbackAppUpdate(app, updates);
            break;
        case 'GridUpdate':
            rollbackGridUpdate(game, updates, update.detail);
            break;
        default:
            console.error('Unhandled rollbackUpdate', ((x: never) => x)(update));
    }
}

function rollbackAppUpdate(app: SudokuApp, updates: ManagedUpdate[]) {
    const reversedUpdates = [...updates].reverse();
    const i = reversedUpdates.findIndex(update => update.type === 'AppUpdate' && ['NewGameUpdate', 'LoadGameUpdate'].includes(update.detail.type));
    const replaySliceEnd = i === -1 ? reversedUpdates.length : i + 1;
    const updatesForReplay = reversedUpdates.slice(0, replaySliceEnd).reverse();

    if (i === -1) {
        app.newGame();
    }

    replayUpdates(app, updatesForReplay);
}

function rollbackGridUpdate(game: SudokuGame, updates: ManagedUpdate[], update: SudokuGameUpdate) {
    switch (update.type) {
        case 'CellUpdate':
            game.cells[update.cellIndex].toggleContents(update.contents);
            break;
        case 'CandidateUpdate':
            game.cells[update.cellIndex].toggleCandidate(update.candidate, update.color);
            break;
        default:
            console.error('Unhandled replayGridUpdate', ((x: never) => x)(update));
    }
}
