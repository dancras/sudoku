import { Persistence } from '@vitorluizc/persistence';
import { map, merge, Observable, of, scan, switchMap, withLatestFrom } from 'rxjs';
import { SudokuGameUpdate } from 'src/Sudoku';
import { SudokuApp, SudokuAppUpdate } from 'src/SudokuApp';

export enum StorageSchemaVersion {
    One
}

export type StorageSchema = {
    version: StorageSchemaVersion,
    updates: ManagedUpdate[]
}

export type ManagedUpdate = {
    type: 'AppUpdate',
    detail: SudokuAppUpdate
} | {
    type: 'GridUpdate',
    detail: SudokuGameUpdate
}

export type ManagedUpdates = Observable<ManagedUpdate>;

export function mergeUpdates(app: SudokuApp): ManagedUpdates {
    return merge(
        app.updates$.pipe(
            map(detail => ({
                type: 'AppUpdate',
                detail
            } as ManagedUpdate))
        ),
        app.game$.pipe(
            switchMap(game => game.updates$),
            map(detail => ({
                type: 'GridUpdate',
                detail
            } as ManagedUpdate))
        )
    );
}

function isStartGameUpdate(update: ManagedUpdate): boolean {
    return update.type === 'AppUpdate' && update.detail.type === 'StartGameUpdate';
}

export function setupStorage(storage: Persistence<StorageSchema>, updates$: ManagedUpdates) {

    const initialUpdates = storage.get()?.updates || [];

    return updates$.pipe(
        scan((acc, next) => {
            if (next.type === 'AppUpdate' && next.detail.type === 'NewGameUpdate') {
                return [];
            } else if (next.type === 'AppUpdate' && next.detail.type === 'ResetGameUpdate') {
                while (acc.length > 0 && !isStartGameUpdate(acc[acc.length - 1])) {
                    acc.pop();
                }
                return acc;
            } else {
                return acc.concat(next);
            }
        }, initialUpdates)
    ).subscribe(updates => {
        storage.set({
            version: StorageSchemaVersion.One,
            updates
        });
    });

}

export function loadFromStorage(storage: Persistence<StorageSchema>, app: SudokuApp) {
    const updates = storage.get()?.updates || [];

    of(...updates).pipe(
        withLatestFrom(app.game$)
    ).subscribe(([update, game]) => {
        if (update.type === 'GridUpdate' && update.detail.type === 'CellUpdate') {
            game.cells[update.detail.cellIndex].toggleContents(update.detail.contents);
        } else if (update.type === 'GridUpdate' && update.detail.type === 'CandidateUpdate') {
            game.cells[update.detail.cellIndex].toggleCandidate(update.detail.candidate);
        } else if (update.type === 'AppUpdate' && update.detail.type === 'StartGameUpdate') {
            app.startGame();
        } else if (update.type === 'AppUpdate' && update.detail.type === 'LoadGameUpdate') {
            app.loadGame(update.detail.contents);
        }
    });
}
