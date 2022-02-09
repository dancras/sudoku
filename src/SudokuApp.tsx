import { BehaviorSubject } from 'rxjs';
import { ValidNumber } from 'src/Sudoku';
import StandardSudokuGame from 'src/Sudoku/StandardSudokuGame';
import 'src/SudokuApp.css';
import NumberPicker, { NumberPickerContext } from 'src/UI/NumberPicker';
import SudokuGrid, { SudokuGameStatus, SudokuGridContext } from 'src/UI/SudokuGrid';

function SudokuApp() {
    const selectedNumber$ = new BehaviorSubject<ValidNumber>(1);
    const game = new StandardSudokuGame();
    const app = {
        status$: new BehaviorSubject(SudokuGameStatus.Creating)
    };

    return (
        <div className="SudokuApp">
            <SudokuGridContext.Provider value={{ selectedNumber$, app, sudokuGrid: game.cells }}>
                <SudokuGrid />
            </SudokuGridContext.Provider>
            <NumberPickerContext.Provider value={{ selectedNumber$ }}>
                <NumberPicker />
            </NumberPickerContext.Provider>
        </div>
    );
}

export default SudokuApp;
