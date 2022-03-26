import { Writeable } from 'src/RxReact';
import { ManagedUpdate } from 'src/SaveLoadUndo/ManagedUpdate';
import { createCandidateUpdate, createCellUpdate, createLoadGameUpdate, createNewGameUpdate, createStartGameUpdate } from 'src/SaveLoadUndo/Mock';
import { replayUpdate, replayUpdates, rollbackUpdate } from 'src/SaveLoadUndo/ReplayRollback';
import { SudokuGame } from 'src/Sudoku';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { SudokuApp } from 'src/SudokuApp';
import { createMockSudokuApp } from 'src/SudokuApp/Mocks';

let app: Writeable<SudokuApp>;
let game: Writeable<SudokuGame>;

beforeEach(() => {
    app = createMockSudokuApp();
    game = createMockSudokuGame();
    app.game$.next(game);
});

describe('replayUpdates()', () => {

    it('calls replayUpdate for provided updates', () => {
        const updates = [
            createCellUpdate(50, 2),
            createCellUpdate(22, 7),
        ];

        replayUpdates(app, updates);

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(2);
        expect(game.cells[22].toggleContents).toHaveBeenCalledWith(7);

        const firstUpdateOrder = game.cells[50].toggleContents.mock.invocationCallOrder[0];
        const secondUpdateOrder = game.cells[22].toggleContents.mock.invocationCallOrder[0];

        expect(firstUpdateOrder).toBeLessThan(secondUpdateOrder);
    });

    it('switches to the latest app.game$ when an event in the sequence updates it', () => {
        const secondGame = createMockSudokuGame();

        app.startGame.mockImplementation(() => {
            app.game$.next(secondGame);
        });

        const updates = [
            createStartGameUpdate(),
            createCellUpdate(50, 2),
        ];

        replayUpdates(app, updates);

        expect(secondGame.cells[50].toggleContents).toHaveBeenCalled();
    });
});

describe('replayUpdate()', () => {

    it('calls togglesContents as specified in a CellUpdate', () => {
        replayUpdate(app, game, createCellUpdate(50, 2));

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(2);
    });

    it('calls toggleCandidate as specified in a CellUpdate', () => {
        replayUpdate(app, game, createCandidateUpdate(22, 7, 'a'));

        expect(game.cells[22].toggleCandidate).toHaveBeenCalledWith(7, 'a');
    });

    it('calls loadGame on app as per LoadGameUpdate', () => {
        replayUpdate(app, game, {
            type: 'AppUpdate',
            detail: {
                type: 'LoadGameUpdate',
                contents: [1, 2, 3],
                startGame: true
            }
        });

        expect(app.loadGame).toHaveBeenCalledWith([1, 2, 3], true);
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

        replayUpdate(app, game, createStartGameUpdate());

        expect(app.startGame).toHaveBeenCalled();
    });

});

describe('rollbackUpdate', () => {

    it('toggles rolled back contents for CellUpdate', () => {
        rollbackUpdate(app, game, [], createCellUpdate(50, 4));

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(4);
    });

    it('toggles rolled back candidate for CandidateUpdate', () => {
        rollbackUpdate(app, game, [], createCandidateUpdate(50, 8, 'a'));

        expect(game.cells[50].toggleCandidate).toHaveBeenCalledWith(8, 'a');
    });

    it('rolls back any AppUpdate by replaying from NewGameUpdate if most recent', () => {
        const updates: ManagedUpdate[] = [
            createCellUpdate(50, 4),
            createNewGameUpdate(),
            createCellUpdate(20, 6),
            createStartGameUpdate()
        ];

        rollbackUpdate(app, game, updates, createStartGameUpdate());

        expect(game.cells[50].toggleContents).not.toHaveBeenCalled();
        expect(app.newGame).toHaveBeenCalled();
        expect(game.cells[20].toggleContents).toHaveBeenCalledWith(6);
        expect(app.startGame).toHaveBeenCalled();
    });

    it('rolls back any AppUpdate by replaying from LoadGameUpdate if most recent', () => {
        const updates: ManagedUpdate[] = [
            createCellUpdate(50, 4),
            createNewGameUpdate(),
            createLoadGameUpdate([1, 2, 3], true),
            createCellUpdate(20, 6),
            createStartGameUpdate()
        ];

        rollbackUpdate(app, game, updates, createNewGameUpdate());

        expect(game.cells[50].toggleContents).not.toHaveBeenCalled();
        expect(app.newGame).not.toHaveBeenCalled();
        expect(app.loadGame).toHaveBeenCalledWith([1, 2, 3], true);
        expect(game.cells[20].toggleContents).toHaveBeenCalledWith(6);
        expect(app.startGame).toHaveBeenCalled();
    });

    it('rolls back any AppUpdate by starting a new game and replaying all events if no recent game starting AppUpdate', () => {
        const updates: ManagedUpdate[] = [
            createCellUpdate(20, 6),
            createStartGameUpdate()
        ];

        rollbackUpdate(app, game, updates, createLoadGameUpdate([], true));

        expect(app.newGame).toHaveBeenCalled();
        expect(game.cells[20].toggleContents).toHaveBeenCalledWith(6);
        expect(app.startGame).toHaveBeenCalled();
    });

});
