import { BehaviorSubject } from 'rxjs';
import { Writeable } from 'src/RxReact';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';

export function createMockSudokuApp(): Writeable<SudokuApp> {
    return {
        status$: new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Creating),
        game$: new BehaviorSubject(createMockSudokuGame()),
        canStart$: new BehaviorSubject<boolean>(false),
        startGame: vi.fn()
    };
}
