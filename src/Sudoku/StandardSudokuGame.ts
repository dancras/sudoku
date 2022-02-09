import { combineLatest, defaultIfEmpty, map, merge, mergeMap, Observable, of, scan, skip, take, withLatestFrom } from 'rxjs';
import { VALID_NUMBERS } from 'src/Sudoku';
import GridCell from 'src/Sudoku/GridCell';
import GridSlice from 'src/Sudoku/GridSlice';
import SudokuCell from 'src/Sudoku/SudokuCell';

const BLOCK_TOP_LEFT_INDEXES = [0, 3, 6, 27, 30, 33, 54, 57, 60];

export default class StandardSudokuGame {
    cells: SudokuCell[];

    isEmpty$: Observable<boolean>;

    isValid$: Observable<boolean>;

    isSolved$: Observable<boolean>;

    constructor() {
        const gridCells = Array.from({ length: 81 }).map(() => new GridCell());

        const rows = VALID_NUMBERS.map(i =>new GridSlice(
            gridCells.slice(i * 9 - 9, i * 9)
        ));

        const columns = VALID_NUMBERS.map(i => new GridSlice(
            getColumnMembers(i - 1).map(j => gridCells[j])
        ));

        const blocks = BLOCK_TOP_LEFT_INDEXES.map(i => new GridSlice(
            getBlockMembers(i).map(j => gridCells[j])
        ));

        this.cells = Array.from({ length: 81 })
            .map((x, i) => new SudokuCell(gridCells[i], [
                rows[getRowIndex(i)],
                columns[getColumnIndex(i)],
                blocks[getBlockIndex(i)]
            ]));

        const totalCountChanges = this.cells.map(cell => merge(
            cell.contents$.pipe(
                take(1),
                map(contents => contents === null ? 0 : 1)
            ),
            cell.contents$.pipe(
                skip(1),
                map(contents => contents === null ? -1 : 1)
            )
        ));

        const totalCount$ = merge(...totalCountChanges).pipe(
            scan((acc, next) => acc + next, 0)
        );

        this.isEmpty$ = totalCount$.pipe(
            map(count => count === 0)
        );

        const countChangesWithOccurrences = merge(...this.cells.map((cell, i) => {
            return merge(...cell.slices.map(slice => totalCountChanges[i].pipe(
                withLatestFrom(cell.contents$),
                mergeMap(([countChange, contents]) => {
                    if (contents === null) {
                        return of([0, 0]);
                    }

                    return of(countChange).pipe(
                        withLatestFrom(slice.occurrences[contents[0]])
                    );
                })
            )));
        }));

        const excessOccurrences = countChangesWithOccurrences.pipe(
            defaultIfEmpty([0, 0]),
            scan((acc, [countChange, occurrences]) => {
                if (countChange === 1 && occurrences > 1) {
                    return acc + 1;
                } else if (countChange === -1 && occurrences > 0) {
                    return acc - 1;
                } else {
                    return acc;
                }
            }, 0)
        );

        this.isValid$ = excessOccurrences.pipe(map(x => {
            return x === 0;
        }));

        this.isSolved$ = combineLatest([totalCount$, excessOccurrences]).pipe(
            map(([totalCount, excessOccurrences]) => {
                return totalCount === 81 && excessOccurrences === 0;
            })
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
