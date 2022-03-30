import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Answer, CandidateColor, CandidateStatus, MapValidsNumberTo, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import GridCell from 'src/Sudoku/GridCell';
import GridSlice from 'src/Sudoku/GridSlice';

export default class SudokuCell {
    private gridCell: GridCell;

    contents$: Observable<Answer | null>;
    candidates: MapValidsNumberTo<Observable<CandidateStatus | null>>;
    isLocked: boolean;

    slices: GridSlice[];

    constructor(gridCell: GridCell, slices: GridSlice[], isLocked: boolean) {
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
                switchMap(color => color === null ?
                    of(null) :
                    combineLatest([
                        of(color),
                        occurrencesOfAnswer(slices, next).pipe(
                            map(occurrences => Math.max(...occurrences) === 0)
                        )
                    ])
                )
            )
        }), {} as typeof this.candidates);

        this.isLocked = isLocked;
    }

    toggleContents(contents: ValidNumber | null) {
        this.gridCell.contents$.next(this.gridCell.contents$.value === contents ? null : contents);
    }

    toggleCandidate(candidate: ValidNumber, color: CandidateColor | null) {
        this.gridCell.candidates[candidate].next(
            this.gridCell.candidates[candidate].value === color ? null : color
        );
    }
}

function occurrencesOfAnswer(slices: GridSlice[], answer: ValidNumber) {
    return combineLatest(slices.map(slice => slice.occurrences[answer]));
}
