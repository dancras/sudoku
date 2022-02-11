import { map, merge, mergeMap, Observable, of, scan, skip, take } from 'rxjs';
import { MapValidsNumberTo, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import GridCell from 'src/Sudoku/GridCell';

export default class GridSlice {
    occurrences: MapValidsNumberTo<Observable<number>>;

    constructor(cells: GridCell[]) {

        const occurrenceChanges$ = merge(...cells.map(cell =>
            cell.contents$.pipe(
                mergeMap(contents => contents === null ? of([1, 0] as [ValidNumber, number]) :
                    merge(
                        of<[ValidNumber, number]>([contents, 1]),
                        cell.contents$.pipe(skip(1), take(1), map(() => [contents, -1] as [ValidNumber, number])))
                )
            )
        ));

        this.occurrences = VALID_NUMBERS.reduce(
            (acc, num: ValidNumber) => Object.assign(acc, {
                [num]: occurrenceChanges$.pipe(
                    scan((acc, [contents, change]) => contents === num ? acc + change : acc, 0)
                )
            }),
            {} as typeof this.occurrences
        );
    }
}
