import { peek } from 'src/RxReact';
import { SudokuGameContents } from 'src/Sudoku';
import { createMockSudokuGame } from 'src/Sudoku/Mocks';
import { SudokuAppUpdate, SudokuGameStatus } from 'src/SudokuApp';
import DefaultApp from 'src/SudokuApp/DefaultApp';

describe('DefaultApp', () => {
    test('canStart$ is false when game is empty or invalid', () => {
        const app = new DefaultApp();
        const game = peek(app.game$);

        expect(peek(app.canStart$)).toEqual(false);

        game.cells[0].toggleContents(1);
        expect(peek(app.canStart$)).toEqual(true);

        game.cells[1].toggleContents(1);
        expect(peek(app.canStart$)).toEqual(false);
    });

    test('canReset$ is true when game is not empty and not solved', () => {
        const app = new DefaultApp();
        const game = createMockSudokuGame();
        app.game$.next(game);

        expect(peek(app.canReset$)).toEqual(false);

        game.isEmpty$.next(false);
        expect(peek(app.canReset$)).toEqual(true);

        game.isSolved$.next(true);
        expect(peek(app.canReset$)).toEqual(false);
    });

    test('startGame() replaces the game with the same contents but locked', () => {
        const app = new DefaultApp();
        const initialGame = peek(app.game$);

        initialGame.cells[0].toggleContents(1);
        initialGame.cells[3].toggleContents(2);
        initialGame.cells[40].toggleContents(3);

        app.startGame();

        const startedGame = peek(app.game$);

        expect(startedGame).not.toBe(initialGame);
        expect(startedGame.getContents()).toEqual(initialGame.getContents());
        expect(peek(startedGame.cells[0].isLocked)).toEqual(true);
        expect(peek(startedGame.cells[3].isLocked)).toEqual(true);
        expect(peek(startedGame.cells[40].isLocked)).toEqual(true);
    });

    test('newGame() replaces the game with an empty one and sets status to Creating', () => {
        const app = new DefaultApp();
        app.startGame();

        const initialGame = peek(app.game$);

        initialGame.cells[0].toggleContents(1);
        initialGame.cells[3].toggleContents(2);

        app.newGame();

        const newGame = peek(app.game$);

        expect(newGame).not.toBe(initialGame);
        expect(newGame.getContents()).toEqual(Array.from({ length: 81 }).fill(null));
        expect(peek(app.status$)).toEqual(SudokuGameStatus.Creating);
    });

    test('resetGame() replaces the game to one with only the locked cells', () => {
        const app = new DefaultApp();
        const creatingGame = peek(app.game$);

        creatingGame.cells[0].toggleContents(1);
        creatingGame.cells[3].toggleContents(2);

        app.startGame();

        const startedGame = peek(app.game$);
        startedGame.cells[1].toggleContents(3);
        startedGame.cells[2].toggleContents(4);

        app.resetGame();

        const resetGame = peek(app.game$);

        expect(resetGame).not.toBe(startedGame);
        expect(resetGame.getContents()).toEqual(creatingGame.getContents());
    });

    test('it emits updates with actions taken', () => {
        const app = new DefaultApp();
        const updateSpy = vi.fn();

        app.updates$.subscribe(updateSpy);

        app.startGame();

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'StartGameUpdate'
        } as SudokuAppUpdate);

        app.resetGame();

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'ResetGameUpdate'
        } as SudokuAppUpdate);

        app.newGame();

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'NewGameUpdate'
        } as SudokuAppUpdate);
    });

    test('loadGame() replaces the game with one matching contents sets status to Solving and emits', () => {
        const app = new DefaultApp();
        const initialGame = peek(app.game$);
        const contents: SudokuGameContents = Array.from({ length: 81 }).map(() => null);
        contents[4] = 5;
        contents[72] = 9;

        const updateSpy = vi.fn();
        app.updates$.subscribe(updateSpy);

        app.loadGame(contents);

        const loadedGame = peek(app.game$);

        expect(loadedGame).not.toBe(initialGame);
        expect(loadedGame.getContents()).toEqual(contents);
        expect(peek(loadedGame.cells[4].isLocked)).toEqual(true);
        expect(peek(loadedGame.cells[72].isLocked)).toEqual(true);
        expect(peek(app.status$)).toEqual(SudokuGameStatus.Solving);

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'LoadGameUpdate',
            contents,
            startGame: true
        } as SudokuAppUpdate);
    });

    test('loadGame() leaves cells unlocked and the game in create mode when startGame param is false', () => {
        const app = new DefaultApp();
        const initialGame = peek(app.game$);
        const contents: SudokuGameContents = Array.from({ length: 81 }).map(() => null);
        contents[4] = 5;
        contents[72] = 9;

        const updateSpy = vi.fn();
        app.updates$.subscribe(updateSpy);

        app.loadGame(contents, false);

        const loadedGame = peek(app.game$);

        expect(loadedGame).not.toBe(initialGame);
        expect(loadedGame.getContents()).toEqual(contents);
        expect(peek(loadedGame.cells[4].isLocked)).toEqual(false);
        expect(peek(loadedGame.cells[72].isLocked)).toEqual(false);
        expect(peek(app.status$)).toEqual(SudokuGameStatus.Creating);

        expect(updateSpy).toHaveBeenCalledWith({
            type: 'LoadGameUpdate',
            contents,
            startGame: false
        } as SudokuAppUpdate);
    });

    test('status$ is Solved when game$ is solved', () => {
        const app = new DefaultApp();
        const game = createMockSudokuGame();
        app.game$.next(game);
        game.isSolved$.next(true);

        expect(peek(app.status$)).toEqual(SudokuGameStatus.Solved);
    });
});
