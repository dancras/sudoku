import createPersistence from '@vitorluizc/persistence';
import NoSleep from 'nosleep.js';
import { useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { loadFromStorage, mergeUpdates, setupStorage, StorageSchema } from 'src/SaveLoadUndo';
import { ValidNumber } from 'src/Sudoku';
import { createSudokuApp } from 'src/SudokuApp';
import 'src/SudokuApp.css';
import ButtonBar, { ButtonBarContext } from 'src/UI/ButtonBar';
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

    useEffect(() => {
        const storage = createPersistence<StorageSchema>('SaveLoadUndo');
        loadFromStorage(storage, app);
        const $updates = mergeUpdates(app);
        setupStorage(storage, $updates);
    }, []);

    function activateNoSleep() {
        if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID === undefined) {
            noSleep.enable();
        }
    }

    return (
        <div className="SudokuApp" onClick={activateNoSleep}>
            <SudokuGridContext.Provider value={{ selectedNumber$, app }}>
                <SudokuGrid />
            </SudokuGridContext.Provider>
            <NumberPickerContext.Provider value={{ selectedNumber$ }}>
                <NumberPicker />
            </NumberPickerContext.Provider>
            <ButtonBarContext.Provider value={{ app }}>
                <ButtonBar />
            </ButtonBarContext.Provider>
        </div>
    );
}

export default AppMain;
