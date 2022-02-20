import createPersistence, { Persistence } from '@vitorluizc/persistence';
import { createSaveLoadUndo, StorageSchema, StorageSchemaVersion } from 'src/SaveLoadUndo';
import { ManagedUpdate, mergeUpdates } from 'src/SaveLoadUndo/ManagedUpdate';
import { SudokuGameUpdate } from 'src/Sudoku';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { createMockSudokuApp } from 'src/SudokuApp/Mocks';
import { createCellUpdate } from './Mock';

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

describe('createSaveLoadUndo()', () => {

    it('initialises using storage data', () => {
        const app = createMockSudokuApp();
        const game = createMockSudokuGame();
        app.game$.next(game);

        mockStorage.set({
            version: StorageSchemaVersion.One,
            data: [[], [createCellUpdate(50, 5)]]
        });

        const saveLoadUndo = createSaveLoadUndo(mockStorage, app);
        saveLoadUndo.setup();

        saveLoadUndo.redo();

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(5);
    });

});
