import { Persistence } from '@vitorluizc/persistence';
import { EMPTY, map, merge, mergeMap, Observable, of, scan, skip, switchMap, withLatestFrom } from 'rxjs';
import { SudokuGameUpdate } from 'src/Sudoku';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';

export enum StorageSchemaVersion {
    One
}

export type StorageSchema = {
    version: StorageSchemaVersion,
    updates: ManagedUpdate[]
}

export type ManagedUpdate = {
    type: 'StartGame'
} | {
    type: 'GridUpdate',
    detail: SudokuGameUpdate
}

export type ManagedUpdates = Observable<ManagedUpdate>;

export function mergeUpdates(app: SudokuApp): ManagedUpdates {
    return merge(
        app.status$.pipe(
            skip(1),
            mergeMap(status => status === SudokuGameStatus.Solving ? of<ManagedUpdate>({
                type: 'StartGame'
            }) : EMPTY)
        ),
        app.game$.pipe(
            switchMap(game => game.updates$),
            map(update => ({
                type: 'GridUpdate',
                detail: update
            } as ManagedUpdate))
        )
    );
}

export function setupStorage(storage: Persistence<StorageSchema>, updates$: ManagedUpdates) {

    const initialUpdates = storage.get()?.updates || [];

    return updates$.pipe(
        scan((acc, next) => acc.concat(next), initialUpdates)
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
        } else if (update.type === 'StartGame') {
            app.startGame();
        }
    });
}
