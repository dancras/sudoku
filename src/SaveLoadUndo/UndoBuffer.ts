import { map, merge, scan, Subject } from 'rxjs';
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
                        return [0, bufferSize] as [number, number];
                    case 'increment':
                        return [bufferSize + 1, 0] as [number, number];
                    case 'clear':
                        return [0, 0] as [number, number];
                }
            }, [0, 0] as [number, number])
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
