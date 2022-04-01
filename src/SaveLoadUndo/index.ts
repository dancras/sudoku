import { Persistence } from '@vitorluizc/persistence';
import { Subject, withLatestFrom } from 'rxjs';
import { ManagedUpdate, ManagedUpdates, mergeUpdates, pruneUpdates } from 'src/SaveLoadUndo/ManagedUpdate';
import { replayUpdate, replayUpdates, rollbackUpdate } from 'src/SaveLoadUndo/ReplayRollback';
import { default as UndoBufferImpl } from 'src/SaveLoadUndo/UndoBuffer';
import UndoRedoCollector from 'src/SaveLoadUndo/UndoRedoCollector';
import { SudokuApp } from 'src/SudokuApp';

export enum StorageSchemaVersion {
    One
}

const CURRENT_STORAGE_SCHEMA_VERSION = StorageSchemaVersion.One;

export type StorageSchema = {
    version: StorageSchemaVersion,
    data: [ManagedUpdate[], ManagedUpdate[]]
}

export type SaveLoadUndo = {
    undo(): void
    redo(): void
    setup(): void
}

export function createSaveLoadUndo(storage: Persistence<StorageSchema>, app: SudokuApp): [SaveLoadUndo, ManagedUpdates] {
    const state = storage.get();
    const data = state && state.version === CURRENT_STORAGE_SCHEMA_VERSION ? state.data : [[], []];
    const collectorSource$ = new Subject<ManagedUpdate>();

    const prunedUpdates = pruneUpdates(data[0]);

    const collector = new UndoRedoCollector(collectorSource$, [prunedUpdates, data[1]]);
    const managedUpdates$ = mergeUpdates(app);

    return [{
        undo() {
            collector.undo();
        },
        redo() {
            collector.redo();
        },
        setup() {
            replayUpdates(app, prunedUpdates);

            managedUpdates$.subscribe(collectorSource$);

            collector.collection$.subscribe(latestData => {
                storage.set({
                    version: CURRENT_STORAGE_SCHEMA_VERSION,
                    data: latestData
                });
            });

            collector.updates$.pipe(withLatestFrom(app.game$)).subscribe(([update, game]) => {
                if (update.type === 'Undo') {
                    rollbackUpdate(app, game, update.history, update.affected);
                } else {
                    replayUpdate(app, game, update.affected);
                }
            });
        }
    }, managedUpdates$];

}

export type UndoBuffer = {
    flush(): void
    clear(): void
}

export function createUndoBuffer(saveLoadUndo: SaveLoadUndo, managedUpdates$: ManagedUpdates) {
    return new UndoBufferImpl(saveLoadUndo, managedUpdates$);
}
