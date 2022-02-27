import createPersistence from '@vitorluizc/persistence';
import NoSleep from 'nosleep.js';
import { useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { extractGridFromImage } from 'src/GridFromImage';
import { createSaveLoadUndo, StorageSchema } from 'src/SaveLoadUndo';
import { loadSharedGame, shareGame, ShareMethod } from 'src/Share/FragmentShare';
import { SudokuGame, ValidNumber } from 'src/Sudoku';
import { createSudokuApp } from 'src/SudokuApp';
import 'src/SudokuApp.css';
import ButtonBar, { ButtonBarContext } from 'src/UI/ButtonBar';
import Messages, { createMessagesModel, MessagesContext } from 'src/UI/Messages';
import NumberPicker, { NumberPickerContext } from 'src/UI/NumberPicker';
import SudokuGrid, { SudokuGridContext } from 'src/UI/SudokuGrid';

let noSleep = {
    enable() {
        // Do nothing in tests
    }
};

if (!navigator.userAgent.includes('jsdom')) {
    noSleep = new NoSleep();
}

function AppMain() {
    const selectedNumber$ = new BehaviorSubject<ValidNumber>(1);
    const app = createSudokuApp();
    const storage = createPersistence<StorageSchema>('SaveLoadUndo');
    const saveLoadUndo = createSaveLoadUndo(storage, app);
    const { messages$, message$, dismiss$ } = createMessagesModel();

    useEffect(() => {
        saveLoadUndo.setup();
        loadSharedGame(app);
    }, []);

    function handleClick() {
        if (typeof process === 'undefined' || process.env.JEST_WORKER_ID === undefined) {
            noSleep.enable();
        }
    }

    function gridFromImage(image: HTMLCanvasElement) {
        return extractGridFromImage(image, (progress) => {
            messages$.next({
                text: [progress.step]
            });

            return waitFrame();
        }).then((contents) => {
            app.loadGame(contents, false);
            dismiss$.next();
        });
    }

    function shareGameWithFeedback(game: SudokuGame) {
        if (shareGame(game) === ShareMethod.Clipboard) {
            messages$.next({
                text: ['Copied To Clipboard.']
            });
        }
    }

    return (
        <div className="SudokuApp" onClick={handleClick}>
            <MessagesContext.Provider value={{ message$, dismiss$ }}>
                <Messages></Messages>
            </MessagesContext.Provider>
            <SudokuGridContext.Provider value={{ selectedNumber$, app }}>
                <SudokuGrid />
            </SudokuGridContext.Provider>
            <NumberPickerContext.Provider value={{ selectedNumber$ }}>
                <NumberPicker />
            </NumberPickerContext.Provider>
            <ButtonBarContext.Provider value={{ app, share: shareGameWithFeedback, saveLoadUndo, gridFromImage }}>
                <ButtonBar />
            </ButtonBarContext.Provider>
        </div>
    );
}

function waitFrame() {
    return new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
    });
}

export default AppMain;
