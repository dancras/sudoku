import { combineLatest, distinctUntilChanged, map, merge, mergeMap, Observable, of, pairwise, scan, skip, startWith, take } from 'rxjs';
import { SudokuGameUpdate, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import GridCell from 'src/Sudoku/GridCell';
import GridSlice from 'src/Sudoku/GridSlice';
import SudokuCell from 'src/Sudoku/SudokuCell';

const BLOCK_TOP_LEFT_INDEXES = [0, 3, 6, 27, 30, 33, 54, 57, 60];

export default class StandardSudokuGame {
    cells: SudokuCell[];

    isEmpty$: Observable<boolean>;

    isValid$: Observable<boolean>;

    isSolved$: Observable<boolean>;

    updates$: Observable<SudokuGameUpdate>;

    getContents(): Array<ValidNumber | null> {
        return this.gridCells.map(cell => cell.contents$.value);
    }

    gridCells: GridCell[];

    constructor(defaultContents?: Array<ValidNumber | null>) {
        this.gridCells = Array.from({ length: 81 }).map(() => new GridCell());

        if (defaultContents) {
            defaultContents.forEach((contents, i) => this.gridCells[i].contents$.next(contents));
        }

        const rows = VALID_NUMBERS.map(i =>new GridSlice(
            this.gridCells.slice(i * 9 - 9, i * 9)
        ));

        const columns = VALID_NUMBERS.map(i => new GridSlice(
            getColumnMembers(i - 1).map(j => this.gridCells[j])
        ));

        const blocks = BLOCK_TOP_LEFT_INDEXES.map(i => new GridSlice(
            getBlockMembers(i).map(j => this.gridCells[j])
        ));

        this.cells = Array.from({ length: 81 })
            .map((x, i) => new SudokuCell(this.gridCells[i], [
                rows[getRowIndex(i)],
                columns[getColumnIndex(i)],
                blocks[getBlockIndex(i)]
            ], !!defaultContents?.[i]));

        this.updates$ = merge(...this.gridCells.map(
            (cell, i) => merge(
                cell.contents$.pipe(
                    skip(1),
                    map(contents => ({
                        type: 'CellUpdate',
                        cellIndex: i,
                        contents
                    } as SudokuGameUpdate))
                ),
                ...VALID_NUMBERS.map(n =>
                    cell.candidates[n].pipe(
                        skip(1),
                        map(isShowing => ({
                            type: 'CandidateUpdate',
                            cellIndex: i,
                            candidate: n,
                            isShowing
                        } as SudokuGameUpdate))
                    )
                )
            )
        ));

        const totalCountChanges = this.gridCells.map(cell =>
            cell.contents$.pipe(
                mergeMap(contents => contents === null ? of(0) :
                    merge(
                        of(1),
                        cell.contents$.pipe(skip(1), take(1), map(() => -1))
                    )
                )
            )
        );

        const totalCount$ = merge(...totalCountChanges).pipe(
            scan((acc, next) => acc + next, 0)
        );

        this.isEmpty$ = totalCount$.pipe(
            map(count => count === 0)
        );

        const excessOccurrences$ = merge(...[...rows, ...columns, ...blocks].flatMap(slice =>
            VALID_NUMBERS.map(n =>
                slice.occurrences[n].pipe(
                    startWith(0),
                    distinctUntilChanged(),
                    pairwise(),
                )
            )
        )).pipe(
            scan((acc, [previous, current]) => {
                if (current > previous && current > 1) {
                    return acc + 1;
                } else if (current < previous && current > 0) {
                    return acc - 1;
                } else {
                    return acc;
                }
            }, 0),
            distinctUntilChanged(),
            startWith(0),
        );

        this.isValid$ = excessOccurrences$.pipe(
            map(x => x === 0)
        );

        this.isSolved$ = combineLatest([totalCount$, this.isValid$]).pipe(
            map(([totalCount, isValid]) => totalCount === 81 && isValid)
        );
    }
}

function getRowStart(i: number) {
    return Math.floor(i / 9) * 9;
}

function getRowIndex(i: number) {
    return Math.floor(getRowStart(i) / 9);
}

function getColumnStart(i: number) {
    return i % 9;
}

function getColumnIndex(i: number) {
    return getColumnStart(i);
}

function getColumnMembers(i: number) {
    const columnStart = i % 9;
    return Array.from({ length: 9 }).map((x, i) => columnStart + i * 9);
}

function getBlockStart(i: number) {
    return (Math.floor(i / 27) * 27) + (i % 9) - (i % 3);
}

function getBlockIndex(i: number) {
    const blockStart = getBlockStart(i);

    if (blockStart < 9) {
        return Math.floor(blockStart / 3);
    } else if (blockStart < 36) {
        return Math.floor(3 + (blockStart - 27) / 3);
    } else {
        return Math.floor(6 + (blockStart - 54) / 3);
    }
}

function getBlockMembers(i: number) {
    const topLeft = getBlockStart(i);
    return [
        topLeft, topLeft + 1, topLeft + 2,
        topLeft + 9, topLeft + 10, topLeft + 11,
        topLeft + 18, topLeft + 19, topLeft + 20
    ];
}
