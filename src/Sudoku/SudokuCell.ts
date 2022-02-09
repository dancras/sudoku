import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import GridCell from 'src/Sudoku/GridCell';
import GridSlice from 'src/Sudoku/GridSlice';
import { MapValidsNumberTo, ValidNumber, VALID_NUMBERS } from 'src/Sudoku/Sudoku';

export type Answer = [ValidNumber, boolean];

export default class SudokuCell {
    private gridCell: GridCell;

    contents$: Observable<Answer | null>;
    candidates: MapValidsNumberTo<Observable<boolean | null>>;
    isLocked$: Observable<boolean>;

    slices: GridSlice[];

    constructor(gridCell: GridCell, slices: GridSlice[]) {
        this.gridCell = gridCell;
        this.slices = slices;

        this.contents$ = gridCell.contents$.pipe(
            switchMap(contents => contents === null ?
                of(null) :
                combineLatest([
                    of(contents),
                    occurrencesOfAnswer(slices, contents).pipe(
                        map(occurrences => Math.max(...occurrences) === 1)
                    )
                ])
            )
        );

        this.candidates = VALID_NUMBERS.reduce((acc, next) => Object.assign(acc, {
            [next]: gridCell.candidates[next].pipe(
                switchMap(isShowing => isShowing ?
                    occurrencesOfAnswer(slices, next).pipe(
                        map(occurrences => Math.max(...occurrences) === 0)
                    ) :
                    of(null)
                )
            )
        }), {} as typeof this.candidates);

        this.isLocked$ = of(false);
    }

    toggleContents(contents: ValidNumber | null) {
        this.gridCell.contents$.next(this.gridCell.contents$.value === contents ? null : contents);
    }

    toggleCandidate(candidate: ValidNumber) {
        this.gridCell.candidates[candidate].next(!this.gridCell.candidates[candidate].value);
    }
}

function occurrencesOfAnswer(slices: GridSlice[], answer: ValidNumber) {
    return combineLatest(slices.map(slice => slice.occurrences[answer]));
}
