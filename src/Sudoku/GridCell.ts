import { BehaviorSubject } from 'rxjs';
import { CandidateColor, MapValidsNumberTo, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';

export default class GridCell {
    contents$: BehaviorSubject<ValidNumber | null>;
    candidates: MapValidsNumberTo<BehaviorSubject<CandidateColor | null>>;

    constructor() {
        this.contents$ = new BehaviorSubject<ValidNumber | null>(null);
        this.candidates = VALID_NUMBERS.reduce((acc, next) => {
            acc[next] = new BehaviorSubject<CandidateColor | null>(null);
            return acc;
        }, {} as typeof this.candidates);
    }
}
