import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { createSudokuGame, SudokuGame } from 'src/Sudoku';
import { SudokuGameStatus } from 'src/SudokuApp';

export default class DefaultApp {

    status$: BehaviorSubject<SudokuGameStatus>;

    game$: BehaviorSubject<SudokuGame>;

    canStart$: Observable<boolean>;

    constructor() {
        this.status$ = new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Creating);
        this.game$ = new BehaviorSubject<SudokuGame>(createSudokuGame());

        this.canStart$ = this.game$.pipe(
            switchMap(game => combineLatest([game.isEmpty$, game.isValid$])),
            map(([isEmpty, isValid]) => !isEmpty && isValid)
        );
    }

    startGame() {
        const contents = this.game$.value.getContents();
        this.game$.next(createSudokuGame(contents));
        this.status$.next(SudokuGameStatus.Solving);
    }
}
