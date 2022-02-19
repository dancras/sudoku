import { Writeable } from 'src/RxReact';
import { ManagedUpdate } from 'src/SaveLoadUndo';
import { replayUpdate, rollbackUpdate } from 'src/SaveLoadUndo/ReplayRollback';
import { SudokuGame, SudokuGameContents, ValidNumber } from 'src/Sudoku';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { SudokuApp } from 'src/SudokuApp';
import { createMockSudokuApp } from 'src/SudokuApp/Mocks';

let app: Writeable<SudokuApp>;
let game: Writeable<SudokuGame>;

function createCellUpdate(cellIndex: number, contents: ValidNumber | null): ManagedUpdate {
    return {
        type: 'GridUpdate',
        detail: {
            type: 'CellUpdate',
            cellIndex,
            contents,
        }
    };
}

function createLoadGameUpdate(contents: SudokuGameContents): ManagedUpdate {
    return {
        type: 'AppUpdate',
        detail: {
            type: 'LoadGameUpdate',
            contents
        }
    };
}

beforeEach(() => {
    app = createMockSudokuApp();
    game = createMockSudokuGame();
});

describe('replayUpdate()', () => {

    it('calls togglesContents as specified in a CellUpdate', () => {
        replayUpdate(app, game, {
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        });

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(2);
    });

    it('calls toggleCandidate as specified in a CellUpdate', () => {
        replayUpdate(app, game, {
            type: 'GridUpdate',
            detail: {
                type: 'CandidateUpdate',
                cellIndex: 22,
                candidate: 7,
                isShowing: true
            }
        });

        expect(game.cells[22].toggleCandidate).toHaveBeenCalledWith(7);
    });

    it('calls loadGame on app as per LoadGameUpdate', () => {
        replayUpdate(app, game, {
            type: 'AppUpdate',
            detail: {
                type: 'LoadGameUpdate',
                contents: [1, 2, 3]
            }
        });

        expect(app.loadGame).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('calls equivalent function for each other AppUpdate', () => {
        replayUpdate(app, game, {
            type: 'AppUpdate',
            detail: {
                type: 'NewGameUpdate'
            }
        });

        expect(app.newGame).toHaveBeenCalled();

        replayUpdate(app, game, {
            type: 'AppUpdate',
            detail: {
                type: 'ResetGameUpdate'
            }
        });

        expect(app.resetGame).toHaveBeenCalled();

        replayUpdate(app, game, {
            type: 'AppUpdate',
            detail: {
                type: 'StartGameUpdate'
            }
        });

        expect(app.startGame).toHaveBeenCalled();
    });

});

describe('rollbackUpdate', () => {

    it('rolls back CellUpdate using most recent CellUpdate for the same cellIndex', () => {
        const updates: ManagedUpdate[] = [
            createCellUpdate(50, 4),
            createCellUpdate(30, 6)
        ];

        rollbackUpdate(app, game, updates, {
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        });

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(4);
    });

    it('rolls back CellUpdate to null if there is no previous update', () => {
        const updates: ManagedUpdate[] = [
            createCellUpdate(30, 6)
        ];

        rollbackUpdate(app, game, updates, {
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        });

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(null);
    });

    it('rolls back CellUpdate to loaded contents if there recent LoadGameUpdate', () => {
        const contents = Array.from({ 50: 6, length: 81 }).map(x => x ? x as ValidNumber : null);
        const updates: ManagedUpdate[] = [
            createCellUpdate(50, 4),
            createLoadGameUpdate(contents)
        ];

        rollbackUpdate(app, game, updates, {
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        });

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(6);
    });

    it('rolls back CellUpdate to null if other AppUpdate is most recent', () => {
        const updates: ManagedUpdate[] = [
            createCellUpdate(50, 4),
            {
                type: 'AppUpdate',
                detail: {
                    type: 'NewGameUpdate'
                }
            }
        ];

        rollbackUpdate(app, game, updates, {
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        });

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(null);
    });

    it('toggles rolled back candidate for CandidateUpdate', () => {
        rollbackUpdate(app, game, [], {
            type: 'GridUpdate',
            detail: {
                type: 'CandidateUpdate',
                cellIndex: 50,
                candidate: 8,
                isShowing: true
            }
        });

        expect(game.cells[50].toggleCandidate).toHaveBeenCalledWith(8);
    });

});

/*

rollBackEvent() {
    if AppUpdate:
        rewind to most recent game start and replay

*/
