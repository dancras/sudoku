import createPersistence, { Persistence } from '@vitorluizc/persistence';
import { Subject } from 'rxjs';
import { Writeable } from 'src/RxReact';
import { loadFromStorage, ManagedUpdate, ManagedUpdates, mergeUpdates, setupStorage, StorageSchema, StorageSchemaVersion } from 'src/SaveLoadUndo';
import { SudokuGameUpdate } from 'src/Sudoku';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { SudokuGameStatus } from 'src/SudokuApp';
import { createMockSudokuApp } from 'src/SudokuApp/Mocks';

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

    it('emits a StartGame when the app status changes to Solving, ignoring other statuses', () => {

        const app = createMockSudokuApp();

        const $updates = mergeUpdates(app);
        const updateSpy = vi.fn();
        $updates.subscribe(updateSpy);

        expect(updateSpy).not.toHaveBeenCalled();

        app.status$.next(SudokuGameStatus.Solving);

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'StartGame'
        });

        app.status$.next(SudokuGameStatus.Solved);

        expect(updateSpy).toHaveBeenCalledTimes(1);

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
            type: 'StartGame'
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
            updates: [{
                type: 'StartGame'

            } as ManagedUpdate, {
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
            updates: [{
                type: 'StartGame'

            }]
        });

        setupStorage(mockStorage, updates$);

        updates$.next({
            type: 'StartGame'
        });

        expect(mockStorage.get()).toEqual({
            version: StorageSchemaVersion.One,
            updates: [{
                type: 'StartGame'
            } , {
                type: 'StartGame'
            }]
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
            }, {
                type: 'StartGame'
            }, {
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
            updates: [{
                type: 'StartGame'
            }]
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
            updates: [{
                type: 'StartGame'
            }, {
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
