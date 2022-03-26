import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Writeable } from 'src/RxReact';
import { Answer, CandidateStatus, MapValidsNumberTo, SudokuCell, SudokuGame, SudokuGameUpdate, VALID_NUMBERS } from 'src/Sudoku';

export function createMockSudokuGame(): Writeable<SudokuGame> {
    return {
        cells: Array.from({ length: 81 }).map(createMockSudokuCell),

        isEmpty$: new BehaviorSubject<boolean>(true),

        isValid$: new BehaviorSubject<boolean>(true),

        isSolved$: new BehaviorSubject<boolean>(false),

        getContents: vi.fn(),

        updates$: new Subject<SudokuGameUpdate>()
    };
}

export function createMockSudokuCell(): Writeable<SudokuCell> {
    return {
        contents$: new BehaviorSubject<Answer | null>(null),
        candidates: VALID_NUMBERS.reduce((acc, n) => Object.assign(acc, {
            [n]: new BehaviorSubject<CandidateStatus | null>(null)
        }), {} as MapValidsNumberTo<BehaviorSubject<CandidateStatus | null>>),
        isLocked: false,
        toggleContents: vi.fn(),
        toggleCandidate: vi.fn(),
    };
}
