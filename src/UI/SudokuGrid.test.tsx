import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { Writeable } from 'src/RxReact';
import { Answer, createSudokuGame, MapValidsNumberTo, SudokuCell, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import { ContextValue, createTestProvider } from 'src/Test/TestContext';
import SudokuGrid, { SudokuGridContext } from 'src/UI/SudokuGrid';

let TestProvider: FunctionComponent;
let setContextValue: (value: typeof contextValue) => void;

let selectedNumber$: Subject<ValidNumber>;
let sudokuGrid: Writeable<SudokuCell>[];
let status$: Subject<SudokuGameStatus>;
let contextValue: Writeable<ContextValue<typeof SudokuGridContext>>;

function setIsLocked(i: number, value: boolean) {
    contextValue.sudokuGrid[i] = { ...contextValue.sudokuGrid[i],
        isLocked: value
    };
    contextValue.sudokuGrid = [...contextValue.sudokuGrid];
    setContextValue({ ...contextValue });
}

beforeEach(() => {
    sudokuGrid = Array.from({ length: 81 }).map(() => ({
        contents$: new BehaviorSubject<Answer | null>(null),
        candidates: VALID_NUMBERS.reduce((acc, i) => Object.assign(acc, {
            [i]: new BehaviorSubject<boolean | null>(null),
        }), {}) as MapValidsNumberTo<Subject<boolean | null>>,
        isLocked: false,
        toggleContents: vi.fn(),
        toggleCandidate: vi.fn()
    } as Writeable<SudokuCell>));

    selectedNumber$ = new BehaviorSubject<ValidNumber>(1);
    status$ = new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Solving);

    [TestProvider, setContextValue] = createTestProvider(SudokuGridContext, contextValue = {
        selectedNumber$,
        sudokuGrid,
        app: {
            status$,
            game$: new BehaviorSubject(createSudokuGame()),
            canStart$: new BehaviorSubject<boolean>(false),
            startGame: vi.fn()
        } as Writeable<SudokuApp>
    });

    render(
        <TestProvider>
            <SudokuGrid />
        </TestProvider>
    );
});

test('cells from GridContents context are rendered', () => {
    expect(screen.getByTestId('sudoku-grid').children).toHaveLength(81);
});

test('cell contents display when set', () => {
    act(() => {
        sudokuGrid[0].contents$.next([5, true]);
        sudokuGrid[1].contents$.next([8, true]);
    });

    expect(screen.getByText(5)).toBeInTheDocument();
    expect(screen.getByText(8)).toBeInTheDocument();
});

test('cell has -ShowingContents class when it has contents to show', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).not.toContain('-ShowingContents');

    act(() => {
        sudokuGrid[0].contents$.next([5, true]);
    });

    expect(firstCell?.className).toContain('-ShowingContents');
});

test('dispatches toggleContents on double click', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    act(() => {
        selectedNumber$.next(4);
    });

    firstCell && userEvent.dblClick(firstCell);

    expect(sudokuGrid[0].toggleContents).toHaveBeenCalledWith(4);
});

test('cell candidates display when set', () => {

    act(() => {
        sudokuGrid[0].candidates[1].next(true);
        sudokuGrid[0].candidates[9].next(true);
    });

    expect(screen.getByText(1)).toBeInTheDocument();
    expect(screen.getByText(9)).toBeInTheDocument();
    expect(screen.queryByText(2)).not.toBeInTheDocument();
});

test('cell has -ShowingCandidates class when it has no contents to show', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).toContain('-ShowingCandidates');

    act(() => {
        sudokuGrid[0].contents$.next([5, true]);
    });

    expect(firstCell?.className).not.toContain('-ShowingCandidates');
});

test('cell has -Locked class when it is locked', async () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).not.toContain('-Locked');

    await setIsLocked(0, true);

    expect(firstCell?.className).toContain('-Locked');
});

test('cell has -Valid or -Invalid class depending on state', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).not.toContain('-Valid');
    expect(firstCell?.className).not.toContain('-Invalid');

    act(() => {
        sudokuGrid[0].contents$.next([5, true]);
    });

    expect(firstCell?.className).toContain('-Valid');
    expect(firstCell?.className).not.toContain('-Invalid');

    act(() => {
        sudokuGrid[0].contents$.next([5, false]);
    });

    expect(firstCell?.className).toContain('-Invalid');
    expect(firstCell?.className).not.toContain('-Valid');
});

test('candidate has -Valid or -Invalid class depending on state', () => {

    act(() => {
        sudokuGrid[0].candidates[1].next(true);
    });

    const candidateElement = screen.getByText(1);

    expect(candidateElement?.className).toContain('-Valid');
    expect(candidateElement?.className).not.toContain('-Invalid');

    act(() => {
        sudokuGrid[0].candidates[1].next(false);
    });

    expect(candidateElement?.className).toContain('-Invalid');
    expect(candidateElement?.className).not.toContain('-Valid');

    act(() => {
        sudokuGrid[0].candidates[1].next(null);
    });

    expect(candidateElement?.className).not.toContain('-Invalid');
    expect(candidateElement?.className).not.toContain('-Valid');
});

test('dispatches toggleCandidate on single click', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    selectedNumber$.next(7);

    firstCell && userEvent.click(firstCell);

    expect(sudokuGrid[0].toggleCandidate).toHaveBeenCalledWith(7);
});

test('cell single click dispatches toggleContents when SudokuGameStatus.Creating', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    selectedNumber$.next(7);

    status$.next(SudokuGameStatus.Creating);

    firstCell && userEvent.click(firstCell);

    expect(sudokuGrid[0].toggleContents).toHaveBeenCalledWith(7);
});

test('cell clicks disabled when SudokuGameStatus.Solved', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    selectedNumber$.next(7);

    status$.next(SudokuGameStatus.Solved);

    firstCell && userEvent.click(firstCell);
    firstCell && userEvent.dblClick(firstCell);

    expect(sudokuGrid[0].toggleContents).not.toHaveBeenCalled();
    expect(sudokuGrid[0].toggleCandidate).not.toHaveBeenCalled();
});

test('cell clicks disabled when cell is locked', async () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    await setIsLocked(0, true);

    firstCell && userEvent.click(firstCell);
    firstCell && userEvent.dblClick(firstCell);

    expect(sudokuGrid[0].toggleContents).not.toHaveBeenCalled();
    expect(sudokuGrid[0].toggleCandidate).not.toHaveBeenCalled();
});
