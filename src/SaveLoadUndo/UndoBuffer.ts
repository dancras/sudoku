import { map, merge, scan, Subject } from 'rxjs';
import { tuple } from 'src/Foundations';
import { SaveLoadUndo } from 'src/SaveLoadUndo';
import { ManagedUpdates } from 'src/SaveLoadUndo/ManagedUpdate';

type UndoBufferAction = 'increment' | 'flush' | 'clear';

export default class UndoBuffer {
    #actions$: Subject<UndoBufferAction>;

    constructor(saveLoadUndo: SaveLoadUndo, updates$: ManagedUpdates) {
        this.#actions$ = new Subject();

        const increments$ = updates$.pipe(map(() => 'increment' as UndoBufferAction));

        const state$ = merge(this.#actions$, increments$).pipe(
            scan(([bufferSize], action) => {
                switch (action) {
                    case 'flush':
                        return tuple(0, bufferSize);
                    case 'increment':
                        return tuple(bufferSize + 1, 0);
                    case 'clear':
                        return tuple(0, 0);
                }
            }, tuple(0, 0))
        );

        state$.subscribe(([, flushLength]) => {
            for (let i = 0; i < flushLength; i++) {
                saveLoadUndo.undo();
            }
        });
    }

    flush() {
        this.#actions$.next('flush');
    }

    clear() {
        this.#actions$.next('clear');
    }
}
