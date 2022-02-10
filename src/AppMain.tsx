import { useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';
import { useObservable } from 'src/RxReact';
import { ValidNumber } from 'src/Sudoku';
import { createSudokuApp } from 'src/SudokuApp';
import 'src/SudokuApp.css';
import ButtonBar, { ButtonBarContext } from 'src/UI/ButtonBar';
import NumberPicker, { NumberPickerContext } from 'src/UI/NumberPicker';
import SudokuGrid, { SudokuGridContext } from 'src/UI/SudokuGrid';

function AppMain() {
    const selectedNumber$ = useMemo(() => new BehaviorSubject<ValidNumber>(1), []);
    const app = useMemo(() => createSudokuApp(), []);
    const game = useObservable(app.game$);

    return (
        <div className="SudokuApp">
            <SudokuGridContext.Provider value={{ selectedNumber$, app, sudokuGrid: game.cells }}>
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
