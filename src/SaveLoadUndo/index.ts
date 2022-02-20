import { Persistence } from '@vitorluizc/persistence';
import { Subject, withLatestFrom } from 'rxjs';
import { ManagedUpdate, mergeUpdates } from 'src/SaveLoadUndo/ManagedUpdate';
import { replayUpdate, replayUpdates, rollbackUpdate } from 'src/SaveLoadUndo/ReplayRollback';
import UndoRedoCollector from 'src/SaveLoadUndo/UndoRedoCollector';
import { SudokuApp } from 'src/SudokuApp';

export enum StorageSchemaVersion {
    One
}

export type StorageSchema = {
    version: StorageSchemaVersion,
    data: [ManagedUpdate[], ManagedUpdate[]]
}

export type SaveLoadUndo = {
    undo(): void
    redo(): void
    setup(): void
}

export function createSaveLoadUndo(storage: Persistence<StorageSchema>, app: SudokuApp): SaveLoadUndo {
    const data = storage.get()?.data || [[], []];
    const collectorSource$ = new Subject<ManagedUpdate>();

    const collector = new UndoRedoCollector(collectorSource$, data);

    return {
        undo() {
            collector.undo();
        },
        redo() {
            collector.redo();
        },
        setup() {
            replayUpdates(app, data[0]);

            mergeUpdates(app).subscribe(collectorSource$);

            collector.collection$.subscribe(data => {
                storage.set({
                    version: StorageSchemaVersion.One,
                    data
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
    };

}
