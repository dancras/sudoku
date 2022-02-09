import { BehaviorSubject } from 'rxjs';
import { MapValidsNumberTo, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';

export default class GridCell {
    contents$: BehaviorSubject<ValidNumber | null>;
    candidates: MapValidsNumberTo<BehaviorSubject<boolean>>;

    constructor() {
        this.contents$ = new BehaviorSubject<ValidNumber | null>(null);
        this.candidates = VALID_NUMBERS.reduce((acc, next) => {
            acc[next] = new BehaviorSubject<boolean>(false);
            return acc;
        }, {} as typeof this.candidates);
    }
}
