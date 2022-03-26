import { BehaviorSubject, combineLatest, map, Observable, shareReplay, Subject, switchMap, withLatestFrom } from 'rxjs';
import { createSudokuGame, SudokuGame, SudokuGameContents } from 'src/Sudoku';
import { SudokuAppUpdate, SudokuGameStatus } from 'src/SudokuApp';

export default class DefaultApp {

    game$: BehaviorSubject<SudokuGame>;

    #status$: BehaviorSubject<SudokuGameStatus>;
    status$: Observable<SudokuGameStatus>;

    canStart$: Observable<boolean>;

    canReset$: Observable<boolean>;

    updates$: Subject<SudokuAppUpdate>;

    constructor() {
        this.game$ = new BehaviorSubject<SudokuGame>(createSudokuGame());

        const gameIsSolved$ = this.game$.pipe(
            switchMap(game => game.isSolved$)
        );

        this.#status$ = new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Creating);
        this.status$ = this.#status$.pipe(
            withLatestFrom(gameIsSolved$),
            map(([status, isSolved]) => isSolved ? SudokuGameStatus.Solved : status),
            shareReplay(1)
        );

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
        this.#status$.next(SudokuGameStatus.Solving);
        this.updates$.next({
            type: 'StartGameUpdate'
        });
    }

    newGame() {
        this.game$.next(createSudokuGame());
        this.#status$.next(SudokuGameStatus.Creating);
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

    loadGame(contents: SudokuGameContents, startGame = true) {
        this.game$.next(createSudokuGame(contents, startGame));

        if (startGame) {
            this.#status$.next(SudokuGameStatus.Solving);
        }

        this.updates$.next({
            type: 'LoadGameUpdate',
            contents,
            startGame
        });
    }
}
