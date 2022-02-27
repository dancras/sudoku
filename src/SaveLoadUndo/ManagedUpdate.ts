import { map, merge, Observable, switchMap } from 'rxjs';
import { SudokuGameUpdate } from 'src/Sudoku';
import { SudokuApp, SudokuAppUpdate } from 'src/SudokuApp';

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

export function pruneUpdates(updates: ManagedUpdate[]) {
    const reversedUpdates = [...updates].reverse();

    const newGameIndex = reversedUpdates.findIndex((update) =>
        update.type === 'AppUpdate' && update.detail.type === 'NewGameUpdate'
    );

    if (newGameIndex !== -1) {
        return reversedUpdates.slice(0, newGameIndex).reverse();
    }

    const loadGameIndex = reversedUpdates.findIndex((update) =>
        update.type === 'AppUpdate' && update.detail.type === 'LoadGameUpdate'
    );

    if (loadGameIndex !== -1) {
        return reversedUpdates.slice(0, loadGameIndex + 1).reverse();
    }

    return updates;
}
