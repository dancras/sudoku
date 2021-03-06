import { BehaviorSubject, Subject } from 'rxjs';
import { Writeable } from 'src/RxReact';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';

export function createMockSudokuApp(): Writeable<SudokuApp> {
    return {
        status$: new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Creating),
        game$: new BehaviorSubject(createMockSudokuGame()),
        canStart$: new BehaviorSubject<boolean>(false),
        canReset$: new BehaviorSubject<boolean>(false),
        updates$: new Subject(),
        startGame: vi.fn(),
        newGame: vi.fn(),
        resetGame: vi.fn(),
        loadGame: vi.fn(),
    };
}
