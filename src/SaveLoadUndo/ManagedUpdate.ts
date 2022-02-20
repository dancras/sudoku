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
