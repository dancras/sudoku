import { createCompositionContext } from 'src/Composition';
import { ButtonBarContext } from 'src/UI/ButtonBar';
import { setupGridFromImage } from 'src/UI/GridFromImage';
import { MessagesContext } from 'src/UI/Messages';
import { NumberPickerContext } from 'src/UI/NumberPicker';
import { setupShare } from 'src/UI/Share';
import { SudokuGridContext } from 'src/UI/SudokuGrid';

export default function CompositionRoot({ context, children }: React.PropsWithChildren<{ context: ReturnType<typeof createCompositionContext>}>) {

    const {
        selectedNumber$,
        currentColor$,
        app,
        saveLoadUndo,
        undoBuffer,
        message$,
        messages$,
        dismiss$
    } = context;

    const share = setupShare(messages$);
    const gridFromImage = setupGridFromImage(app, messages$, dismiss$);

    return (
        <MessagesContext.Provider value={{ message$, dismiss$ }}>
            <SudokuGridContext.Provider value={{ selectedNumber$, currentColor$, app, undoBuffer }}>
                <NumberPickerContext.Provider value={{ selectedNumber$, currentColor$ }}>
                    <ButtonBarContext.Provider value={{ app, share, saveLoadUndo, gridFromImage }}>
                        { children }
                    </ButtonBarContext.Provider>
                </NumberPickerContext.Provider>
            </SudokuGridContext.Provider>
        </MessagesContext.Provider>
    );

}
