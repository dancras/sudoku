import { peek } from 'src/RxReact';
import { SudokuGameContents, SudokuGameUpdate, ValidNumber } from 'src/Sudoku';
import StandardSudokuGrid from 'src/Sudoku/StandardSudokuGame';

test('it has 81 cells', () => {
    const grid = new StandardSudokuGrid();
    expect(grid.cells).toHaveLength(81);
});

test('it accepts default cell contents', () => {
    const defaultContents = [] as SudokuGameContents;
    defaultContents[1] = null;
    defaultContents[3] = 5;
    // defaultContents[40] left blank to test sparse array
    defaultContents[60] = 7;

    const grid = new StandardSudokuGrid(defaultContents);

    expect(peek(grid.cells[3].contents$)).toEqual([5, true]);
    expect(grid.cells[3].isLocked).toEqual(true);
    expect(peek(grid.cells[60].contents$)).toEqual([7, true]);
    expect(grid.cells[60].isLocked).toEqual(true);

    expect(grid.cells[1].isLocked).toEqual(false);
    expect(grid.cells[40].isLocked).toEqual(false);
});

test('it does not lock default contents when lockDefaultContents is false', () => {
    const defaultContents = [] as SudokuGameContents;
    defaultContents[1] = null;
    defaultContents[3] = 5;
    // defaultContents[40] left blank to test sparse array
    defaultContents[60] = 7;

    const grid = new StandardSudokuGrid(defaultContents, false);

    expect(grid.cells[3].isLocked).toEqual(false);
    expect(grid.cells[60].isLocked).toEqual(false);
    expect(grid.cells[1].isLocked).toEqual(false);
    expect(grid.cells[40].isLocked).toEqual(false);
});

test('cells are added to the correct rows', () => {
    const grid = new StandardSudokuGrid();

    grid.cells[0].toggleContents(1);
    grid.cells[3].toggleContents(1);
    grid.cells[10].toggleContents(2);
    grid.cells[27].toggleContents(2);

    expect(peek(grid.cells[0].contents$)).toEqual([1, false]);
    expect(peek(grid.cells[3].contents$)).toEqual([1, false]);
    expect(peek(grid.cells[10].contents$)).toEqual([2, true]);
    expect(peek(grid.cells[27].contents$)).toEqual([2, true]);

    grid.cells[27].toggleContents(3);
    grid.cells[30].toggleContents(3);
    grid.cells[37].toggleContents(4);
    grid.cells[54].toggleContents(4);

    expect(peek(grid.cells[27].contents$)).toEqual([3, false]);
    expect(peek(grid.cells[30].contents$)).toEqual([3, false]);
    expect(peek(grid.cells[37].contents$)).toEqual([4, true]);
    expect(peek(grid.cells[54].contents$)).toEqual([4, true]);
});

test('cells are added to the correct columns', () => {
    const grid = new StandardSudokuGrid();

    grid.cells[0].toggleContents(1);
    grid.cells[27].toggleContents(1);
    grid.cells[10].toggleContents(2);
    grid.cells[3].toggleContents(2);

    expect(peek(grid.cells[0].contents$)).toEqual([1, false]);
    expect(peek(grid.cells[27].contents$)).toEqual([1, false]);
    expect(peek(grid.cells[10].contents$)).toEqual([2, true]);
    expect(peek(grid.cells[3].contents$)).toEqual([2, true]);

    grid.cells[3].toggleContents(3);
    grid.cells[30].toggleContents(3);
    grid.cells[13].toggleContents(4);
    grid.cells[6].toggleContents(4);

    expect(peek(grid.cells[3].contents$)).toEqual([3, false]);
    expect(peek(grid.cells[30].contents$)).toEqual([3, false]);
    expect(peek(grid.cells[13].contents$)).toEqual([4, true]);
    expect(peek(grid.cells[6].contents$)).toEqual([4, true]);
});

test('cells are added to the correct block', () => {
    const grid = new StandardSudokuGrid();

    grid.cells[0].toggleContents(1);
    grid.cells[10].toggleContents(1);
    grid.cells[3].toggleContents(2);
    grid.cells[27].toggleContents(2);

    expect(peek(grid.cells[0].contents$)).toEqual([1, false]);
    expect(peek(grid.cells[10].contents$)).toEqual([1, false]);
    expect(peek(grid.cells[3].contents$)).toEqual([2, true]);
    expect(peek(grid.cells[27].contents$)).toEqual([2, true]);

    grid.cells[40].toggleContents(3);
    grid.cells[50].toggleContents(3);
    grid.cells[67].toggleContents(4);
    grid.cells[43].toggleContents(4);

    expect(peek(grid.cells[40].contents$)).toEqual([3, false]);
    expect(peek(grid.cells[50].contents$)).toEqual([3, false]);
    expect(peek(grid.cells[67].contents$)).toEqual([4, true]);
    expect(peek(grid.cells[43].contents$)).toEqual([4, true]);
});

test('isEmpty$ is false when any cell has contents', () => {
    const grid = new StandardSudokuGrid();

    expect(peek(grid.isEmpty$)).toEqual(true);

    grid.cells[0].toggleContents(1);
    grid.cells[9].toggleContents(1);

    expect(peek(grid.isEmpty$)).toEqual(false);

    grid.cells[0].toggleContents(1);

    expect(peek(grid.isEmpty$)).toEqual(false);

    grid.cells[9].toggleContents(1);

    expect(peek(grid.isEmpty$)).toEqual(true);
});

test('isEmpty$ is true when only locked cells have contents', () => {
    const grid = new StandardSudokuGrid([6]);

    expect(peek(grid.isEmpty$)).toEqual(true);

    grid.cells[0].toggleContents(1);
});

test('isValid$ is true when no row column or block has more than 1', () => {
    const grid = new StandardSudokuGrid();

    expect(peek(grid.isValid$)).toEqual(true);

    // 1 2 * * * * * * *
    // * * * 1 * * 2 * *
    // * *
    // * 1
    grid.cells[0].toggleContents(1);
    grid.cells[1].toggleContents(2);
    grid.cells[12].toggleContents(1);
    grid.cells[15].toggleContents(2);
    grid.cells[28].toggleContents(1);

    expect(peek(grid.isValid$)).toEqual(true);
});

test('isValid$ is false when row, column or block has more than 1 of a number', () => {
    const grid = new StandardSudokuGrid();

    // 1 * * 1 * * * * *
    grid.cells[0].toggleContents(1);
    grid.cells[3].toggleContents(1);
    expect(peek(grid.isValid$)).toEqual(false);

    // 1 * * * * * * * *
    grid.cells[3].toggleContents(null);
    expect(peek(grid.isValid$)).toEqual(true);

    // 1 * * * * * * * *
    // 1 * *
    grid.cells[9].toggleContents(1);
    expect(peek(grid.isValid$)).toEqual(false);

    // 1 2 * * * * * * *
    // 2 * *
    grid.cells[1].toggleContents(2);
    grid.cells[9].toggleContents(2);
    expect(peek(grid.isValid$)).toEqual(false);

    // 1 * * * * * * * *
    // 2 * *
    grid.cells[1].toggleContents(null);
    expect(peek(grid.isValid$)).toEqual(true);
});

test('isSolved$ is true when all cells are filled and the grid is valid', () => {
    const grid = new StandardSudokuGrid();

    const solutionText = `
483921657
967345821
251876493
548132976
729564138
136798245
372689514
814253769
695417382`;

    let i = 0;
    solutionText.trim().split('\n').forEach(line => {
        const row = line.trim().split('');
        row.forEach(cell => {
            grid.cells[i].toggleContents(parseInt(cell) as ValidNumber);
            i++;
        });
    });

    expect(peek(grid.isSolved$)).toEqual(true);

    grid.cells[0].toggleContents(5);
    expect(peek(grid.isSolved$)).toEqual(false);

    grid.cells[0].toggleContents(4);
    expect(peek(grid.isSolved$)).toEqual(true);

    grid.cells[2].toggleContents(null);
    expect(peek(grid.isSolved$)).toEqual(false);

    grid.cells[2].toggleContents(3);
    expect(peek(grid.isSolved$)).toEqual(true);

    grid.cells[8].toggleContents(3);
    expect(peek(grid.isSolved$)).toEqual(false);
});

test('getContents() returns the current grid contents', () => {
    const grid = new StandardSudokuGrid();

    grid.cells[0].toggleContents(5);
    grid.cells[49].toggleContents(8);
    grid.cells[80].toggleContents(9);

    const expected: Array<number | null> = Array.from({ length: 81 }).map(() => null);
    expected[0] = 5;
    expected[49] = 8;
    expected[80] = 9;

    expect(grid.getContents()).toEqual(expected);
});

test('updates$ emits cell updates with correct info', () => {

    const grid = new StandardSudokuGrid();
    const updateSpy = vi.fn();

    grid.updates$.subscribe(updateSpy);

    expect(updateSpy).not.toHaveBeenCalled();

    grid.cells[0].toggleContents(5);

    expect(updateSpy).toHaveBeenCalledWith({
        type: 'CellUpdate',
        cellIndex: 0,
        contents: 5
    } as SudokuGameUpdate);

    grid.cells[50].toggleContents(2);

    expect(updateSpy).toHaveBeenCalledWith({
        type: 'CellUpdate',
        cellIndex: 50,
        contents: 2
    } as SudokuGameUpdate);

    grid.cells[50].toggleContents(2);

    expect(updateSpy).toHaveBeenCalledWith({
        type: 'CellUpdate',
        cellIndex: 50,
        contents: null
    } as SudokuGameUpdate);

});

test('updates$ emits candidate updates with correct info', () => {

    const grid = new StandardSudokuGrid();
    const updateSpy = vi.fn();

    grid.updates$.subscribe(updateSpy);

    grid.cells[0].toggleCandidate(7);

    expect(updateSpy).toHaveBeenCalledWith({
        type: 'CandidateUpdate',
        cellIndex: 0,
        candidate: 7,
        isShowing: true
    } as SudokuGameUpdate);

    grid.cells[23].toggleCandidate(2);

    expect(updateSpy).toHaveBeenCalledWith({
        type: 'CandidateUpdate',
        cellIndex: 23,
        candidate: 2,
        isShowing: true
    } as SudokuGameUpdate);

    grid.cells[0].toggleCandidate(7);

    expect(updateSpy).toHaveBeenCalledWith({
        type: 'CandidateUpdate',
        cellIndex: 0,
        candidate: 7,
        isShowing: false
    } as SudokuGameUpdate);

});
