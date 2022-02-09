import { combineLatest, map, Observable } from 'rxjs';
import GridCell from 'src/Sudoku/GridCell';
import { MapValidsNumberTo, ValidNumber, VALID_NUMBERS } from 'src/Sudoku/Sudoku';

export default class GridSlice {
    occurrences: MapValidsNumberTo<Observable<number>>;

    constructor(cells: GridCell[]) {

        // map contents to a occurrences change stream
        // scan occurrences
        // combine scan with change stream
        // creates excess occurrences stream
        // scan those

        const allCellContents$ = combineLatest(cells.map(x => x.contents$));

        this.occurrences = VALID_NUMBERS.reduce(
            (acc, num: ValidNumber) => Object.assign(acc, {
                [num]: allCellContents$.pipe(
                    map(allContents => allContents.reduce(
                        (total, next) => next === num ? total + 1 : total, 0
                    ))
                )
            }),
            {} as typeof this.occurrences
        );
    }
}
