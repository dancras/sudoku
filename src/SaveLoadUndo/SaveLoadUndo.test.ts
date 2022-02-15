import createPersistence, { Persistence } from '@vitorluizc/persistence';
import { Subject } from 'rxjs';
import { Writeable } from 'src/RxReact';
import { loadFromStorage, ManagedUpdate, ManagedUpdates, mergeUpdates, setupStorage, StorageSchema, StorageSchemaVersion } from 'src/SaveLoadUndo';
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

describe('setupStorage()', () => {

    it('adds managed updates to the storage', () => {
        const updates$: Writeable<ManagedUpdates> = new Subject();

        setupStorage(mockStorage, updates$);

        updates$.next({
            type: 'AppUpdate',
            detail: {
                type: 'StartGameUpdate'
            }
        });

        updates$.next({
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        });

        expect(mockStorage.get()).toEqual({
            version: StorageSchemaVersion.One,
            updates: [START_GAME_UPDATE, {
                type: 'GridUpdate',
                detail: {
                    type: 'CellUpdate',
                    cellIndex: 50,
                    contents: 2
                }
            } as ManagedUpdate]
        });
    });

    it('resumes from any existing storage stage', () => {
        const updates$: Writeable<ManagedUpdates> = new Subject();

        mockStorage.set({
            version: StorageSchemaVersion.One,
            updates: [START_GAME_UPDATE]
        });

        setupStorage(mockStorage, updates$);

        updates$.next(START_GAME_UPDATE);

        expect(mockStorage.get()).toEqual({
            version: StorageSchemaVersion.One,
            updates: [START_GAME_UPDATE , START_GAME_UPDATE]
        });
    });

    it('empties the storage when a NewGameUpdate is received', () => {
        const updates$: Writeable<ManagedUpdates> = new Subject();

        setupStorage(mockStorage, updates$);

        updates$.next(START_GAME_UPDATE);

        updates$.next({
            type: 'AppUpdate',
            detail: {
                type: 'NewGameUpdate'
            }
        });

        expect(mockStorage.get()).toEqual({
            version: StorageSchemaVersion.One,
            updates: []
        });
    });

    it('empties the storage upto the most recent StartGameUpdate when ResetGameUpdate received', () => {
        const updates$: Writeable<ManagedUpdates> = new Subject();

        setupStorage(mockStorage, updates$);

        updates$.next({
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: 2
            }
        });

        updates$.next(START_GAME_UPDATE);

        updates$.next({
            type: 'GridUpdate',
            detail: {
                type: 'CellUpdate',
                cellIndex: 50,
                contents: null
            }
        });

        updates$.next({
            type: 'AppUpdate',
            detail: {
                type: 'ResetGameUpdate'
            }
        });

        expect(mockStorage.get()).toEqual({
            version: StorageSchemaVersion.One,
            updates: [{
                type: 'GridUpdate',
                detail: {
                    type: 'CellUpdate',
                    cellIndex: 50,
                    contents: 2
                }
            }, START_GAME_UPDATE]
        });
    });

});

describe('loadFromStorage()', () => {

    it('replays the updates in storage on the app', () => {
        const app = createMockSudokuApp();
        const game = createMockSudokuGame();
        app.game$.next(game);

        mockStorage.set({
            version: StorageSchemaVersion.One,
            updates: [{
                type: 'GridUpdate',
                detail: {
                    type: 'CellUpdate',
                    cellIndex: 50,
                    contents: 2
                }
            }, START_GAME_UPDATE, {
                type: 'GridUpdate',
                detail: {
                    type: 'CandidateUpdate',
                    cellIndex: 22,
                    candidate: 7,
                    isShowing: true
                }
            }]
        });

        loadFromStorage(mockStorage, app);

        expect(game.cells[50].toggleContents).toHaveBeenCalledWith(2);
        expect(app.startGame).toHaveBeenCalled();
        expect(game.cells[22].toggleCandidate).toHaveBeenCalledWith(7);

        const contentsUpdateOrder = game.cells[50].toggleContents.mock.invocationCallOrder[0];
        const startGameOrder = app.startGame.mock.invocationCallOrder[0];
        const candidateUpdateOrder = game.cells[22].toggleCandidate.mock.invocationCallOrder[0];

        expect(contentsUpdateOrder).toBeLessThan(startGameOrder);
        expect(startGameOrder).toBeLessThan(candidateUpdateOrder);

    });

    it('does not replay all the events when app.game$ emits', () => {
        const app = createMockSudokuApp();
        const game = createMockSudokuGame();
        app.game$.next(game);

        mockStorage.set({
            version: StorageSchemaVersion.One,
            updates: [START_GAME_UPDATE]
        });

        loadFromStorage(mockStorage, app);

        expect(app.startGame).toHaveBeenCalled();
        app.startGame.mockClear();

        app.game$.next(createMockSudokuGame());
        expect(app.startGame).not.toHaveBeenCalled();
    });

    it('plays each event on the latest app.game$', () => {
        const app = createMockSudokuApp();
        const game = createMockSudokuGame();
        app.game$.next(game);

        const secondGame = createMockSudokuGame();

        app.startGame.mockImplementation(() => {
            app.game$.next(secondGame);
        });

        mockStorage.set({
            version: StorageSchemaVersion.One,
            updates: [START_GAME_UPDATE, {
                type: 'GridUpdate',
                detail: {
                    type: 'CellUpdate',
                    cellIndex: 50,
                    contents: 2
                }
            }]
        });

        loadFromStorage(mockStorage, app);

        expect(secondGame.cells[50].toggleContents).toHaveBeenCalled();
    });

});
