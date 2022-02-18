import { BehaviorSubject, combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { createSudokuGame, SudokuGame, SudokuGameContents } from 'src/Sudoku';
import { SudokuAppUpdate, SudokuGameStatus } from 'src/SudokuApp';

export default class DefaultApp {

    status$: BehaviorSubject<SudokuGameStatus>;

    game$: BehaviorSubject<SudokuGame>;

    canStart$: Observable<boolean>;

    canReset$: Observable<boolean>;

    updates$: Subject<SudokuAppUpdate>;

    constructor() {
        this.status$ = new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Creating);
        this.game$ = new BehaviorSubject<SudokuGame>(createSudokuGame());

        this.canStart$ = this.game$.pipe(
            switchMap(game => combineLatest([game.isEmpty$, game.isValid$])),
            map(([isEmpty, isValid]) => !isEmpty && isValid)
        );

        this.canReset$ = this.game$.pipe(
            switchMap(game => combineLatest([game.isEmpty$, game.isSolved$])),
            map(([isEmpty, isSolved]) => !isEmpty && !isSolved)
        );

        this.updates$ = new Subject();
    }

    startGame() {
        const contents = this.game$.value.getContents();
        this.game$.next(createSudokuGame(contents));
        this.status$.next(SudokuGameStatus.Solving);
        this.updates$.next({
            type: 'StartGameUpdate'
        });
    }

    newGame() {
        this.game$.next(createSudokuGame());
        this.status$.next(SudokuGameStatus.Creating);
        this.updates$.next({
            type: 'NewGameUpdate'
        });
    }

    resetGame() {
        const lockedContents = this.game$.value.getContents()
            .map((contents, i) => this.game$.value.cells[i].isLocked ? contents : null);

        this.game$.next(createSudokuGame(lockedContents));
        this.updates$.next({
            type: 'ResetGameUpdate'
        });
    }

    loadGame(contents: SudokuGameContents) {
        this.game$.next(createSudokuGame(contents));
        this.status$.next(SudokuGameStatus.Solving);
        this.updates$.next({
            type: 'LoadGameUpdate',
            contents
        });
    }
}
