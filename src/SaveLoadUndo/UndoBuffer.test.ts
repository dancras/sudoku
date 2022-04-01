import { Subject } from 'rxjs';
import { ManagedUpdate } from 'src/SaveLoadUndo/ManagedUpdate';
import { createCellUpdate, createMockSaveLoadUndo } from 'src/SaveLoadUndo/Mock';
import UndoBuffer from 'src/SaveLoadUndo/UndoBuffer';

describe('UndoBuffer', () => {

    it('undoes all buffered updates on when flushed', () => {
        const saveLoadUndo = createMockSaveLoadUndo();
        const updates$ = new Subject<ManagedUpdate>();
        const undoBuffer = new UndoBuffer(saveLoadUndo, updates$);

        updates$.next(createCellUpdate(0, 9));
        updates$.next(createCellUpdate(5, 4));

        undoBuffer.flush();

        expect(saveLoadUndo.undo).toBeCalledTimes(2);

        saveLoadUndo.undo.mockClear();
        undoBuffer.flush();

        expect(saveLoadUndo.undo).not.toBeCalled();
    });

    it('does not undo cleared updates when flushed', () => {
        const saveLoadUndo = createMockSaveLoadUndo();
        const updates$ = new Subject<ManagedUpdate>();
        const undoBuffer = new UndoBuffer(saveLoadUndo, updates$);

        updates$.next(createCellUpdate(0, 9));

        undoBuffer.clear();
        undoBuffer.flush();

        expect(saveLoadUndo.undo).not.toBeCalled();
    });

});
