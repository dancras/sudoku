import createPersistence, { Persistence } from '@vitorluizc/persistence';
import { createSaveLoadUndo, StorageSchema, StorageSchemaVersion } from 'src/SaveLoadUndo';
import { ManagedUpdate, mergeUpdates, pruneUpdates } from 'src/SaveLoadUndo/ManagedUpdate';
import { createCandidateUpdate, createCellUpdate, createLoadGameUpdate, createNewGameUpdate, createResetGameUpdate, createStartGameUpdate } from 'src/SaveLoadUndo/Mock';
import { SudokuGameUpdate } from 'src/Sudoku';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { createMockSudokuApp } from 'src/SudokuApp/Mocks';

const START_GAME_UPDATE: ManagedUpdate = {
    type: 'AppUpdate',
    detail: {
        type: 'StartGameUpdate'
    }
};

let mockStorage: Persistence<StorageSchema>;

beforeEach(() => {
    const data: Record<string, string> = {};

    mockStorage = createPersistence<StorageSchema>('testStorage', {
        storage: {
            getItem(key: string): string | null {
                return data[key] || null;
            },
            setItem(key: string, value: string) {
                data[key] = value;
            },
            removeItem(key: string) {
                data[key];
            }
        }
    });
});

describe('mergeUpdates()', () => {

    it('emits an AppUpdate when the app updates', () => {

        const app = createMockSudokuApp();

        const $updates = mergeUpdates(app);
        const updateSpy = vi.fn();
        $updates.subscribe(updateSpy);

        expect(updateSpy).not.toHaveBeenCalled();

        app.updates$.next({
            type: 'StartGameUpdate'
        });

        expect(updateSpy).toHaveBeenCalledWith(START_GAME_UPDATE);

    });

    it('emits a GridUpdate when the current game updates', () => {
        const app = createMockSudokuApp();
        const game = createMockSudokuGame();
        app.game$.next(game);

        const $updates = mergeUpdates(app);
        const updateSpy = vi.fn();
        $updates.subscribe(updateSpy);

        expect(updateSpy).not.toHaveBeenCalled();

        game.updates$.next({
            type: 'CellUpdate',
            cellIndex: 50,
            contents: 2
        } as SudokuGameUpdate);

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        } as ManagedUpdate);
    });
});

describe('pruneUpdates()', () => {
    it('does nothing if there are no LoadGameUpdate or NewGameUpdate', () => {
        const updates = [
            createCellUpdate(20, 5),
            createStartGameUpdate(),
            createCandidateUpdate(20, 2, 'a'),
            createResetGameUpdate()
        ];

        expect(pruneUpdates(updates)).toEqual(updates);
    });

    it('removes updates up to and including the most recent NewGameUpdate', () => {
        const before = [
            createCellUpdate(20, 5),
            createNewGameUpdate(),
        ];

        const after = [
            createCellUpdate(20, 5),
            createStartGameUpdate(),
        ];

        expect(pruneUpdates(before.concat(after))).toEqual(after);
    });

    it('removes updates up to but not including the most recent LoadGameUpdate', () => {
        const before = [
            createCellUpdate(20, 5),
        ];

        const after = [
            createLoadGameUpdate([], true),
            createCellUpdate(20, 5),
            createStartGameUpdate(),
        ];

        expect(pruneUpdates(before.concat(after))).toEqual(after);
    });
});

describe('createSaveLoadUndo()', () => {

    it('initialises using pruned storage data', () => {
        const app = createMockSudokuApp();
        const game = createMockSudokuGame();
        app.game$.next(game);

        mockStorage.set({
            version: StorageSchemaVersion.One,
            data: [[
                createCellUpdate(20, 5),
                createNewGameUpdate(),
            ], [
                createCellUpdate(50, 5)
            ]]
        });

        const saveLoadUndo = createSaveLoadUndo(mockStorage, app);
        saveLoadUndo.setup();

        saveLoadUndo.redo();

        expect(game.cells[20].toggleContents).not.toHaveBeenCalled();
        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(5);
    });

});
