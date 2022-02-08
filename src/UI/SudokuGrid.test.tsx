import { act, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'preact';
import { BehaviorSubject, Subject } from 'rxjs';
import { Writeable } from 'src/RxPreact';
import SudokuGrid, { SudokuCell, SudokuGameStatus, SudokuGridContext } from 'src/UI/SudokuGrid';
import { createTestProvider } from 'src/Test/TestContext';

let TestProvider: FunctionComponent;

let selectedNumber$: Subject<number>;
let sudokuGrid: Writeable<SudokuCell>[];
let status$: Subject<SudokuGameStatus>;

beforeEach(() => {
    sudokuGrid = Array.from({ length: 81 }).map(() => ({
        contents$: new BehaviorSubject(null),
        candidates: {
            1: new BehaviorSubject(null),
            9: new BehaviorSubject(null)
        },
        isLocked$: new BehaviorSubject(false),
        toggleContents: vi.fn(),
        toggleCandidate: vi.fn()
    } as Writeable<SudokuCell>));

    selectedNumber$ = new BehaviorSubject(1);
    status$ = new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Solving);

    [TestProvider] = createTestProvider(SudokuGridContext, {
        selectedNumber$,
        sudokuGrid,
        game: { status$ }
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

test('cell has -Locked class when it is locked', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).not.toContain('-Locked');

    act(() => {
        sudokuGrid[0].isLocked$.next(true);
    });

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

test('cell clicks disabled when cell is locked', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    act(() => {
        sudokuGrid[0].isLocked$.next(true);
    });

    firstCell && userEvent.click(firstCell);
    firstCell && userEvent.dblClick(firstCell);

    expect(sudokuGrid[0].toggleContents).not.toHaveBeenCalled();
    expect(sudokuGrid[0].toggleCandidate).not.toHaveBeenCalled();
});