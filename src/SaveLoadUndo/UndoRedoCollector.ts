import { distinctUntilChanged, EMPTY, filter, map, merge, mergeMap, Observable, of, scan, shareReplay, skip, startWith, Subject } from 'rxjs';
import { prewarm } from 'src/RxReact';

type UndoAction = 'SaveLoadUndoAction_Undo' | 'SaveLoadUndoAction_Redo';

export type UndoRedoUpdate<T> = {
    type: 'Undo' | 'Redo',
    affected: T,
    history: T[]
}

type IntermediaryValue<T> = [[T[], T[]], UndoAction | null, T | null]

export default class UndoRedoCollector<T> {

    #actions$: Subject<UndoAction>;

    #skipUpdates: boolean;

    collection$: Observable<[T[], T[]]>;

    updates$: Observable<UndoRedoUpdate<T>>;

    constructor(source$: Observable<T>, initialCollection: [T[], T[]]) {
        this.#actions$ = new Subject();

        this.#skipUpdates = false;

        const filteredSource$ = source$.pipe(filter(() => !this.#skipUpdates));
        const intermediary$ = merge(filteredSource$, this.#actions$).pipe(
            scan((acc, value) => {
                if (value === 'SaveLoadUndoAction_Undo') {
                    const [[undos, redos]] = acc;

                    const undone = undos.pop();

                    if (undone === undefined) {
                        return acc;
                    }

                    redos.push(undone);

                    return [[undos, redos], value, undone] as IntermediaryValue<T>;
                } else if (value === 'SaveLoadUndoAction_Redo') {
                    const [[undos, redos]] = acc;

                    const redone = redos.pop();

                    if (redone === undefined) {
                        return acc;
                    }

                    undos.push(redone);

                    return [[undos, redos], value, redone] as IntermediaryValue<T>;
                } else {
                    const [[undos]] = acc;
                    return [[undos.concat(value), []], null, null] as IntermediaryValue<T>;
                }
            }, [initialCollection, null, null] as IntermediaryValue<T>),
            startWith([initialCollection, null, null] as IntermediaryValue<T>),
            distinctUntilChanged(),
            shareReplay(1)
        );

        this.collection$ = intermediary$.pipe(skip(1), map(x => x[0]));

        this.updates$ = intermediary$.pipe(skip(1), mergeMap(([[undos], action, affected]) => {
            if (action !== null && affected !== null) {
                return of({
                    type: action === 'SaveLoadUndoAction_Undo' ? 'Undo' : 'Redo',
                    affected,
                    history: undos
                } as UndoRedoUpdate<T>);
            } else {
                return EMPTY;
            }
        }));
    }

    undo() {
        this.#skipUpdates = true;
        this.#actions$.next('SaveLoadUndoAction_Undo');
        this.#skipUpdates = false;
    }

    redo() {
        this.#skipUpdates = true;
        this.#actions$.next('SaveLoadUndoAction_Redo');
        this.#skipUpdates = false;
    }
}
