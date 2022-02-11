import { peek } from 'src/RxReact';
import DefaultApp from 'src/SudokuApp/DefaultApp';

describe('DefaultApp', () => {
    test('canStart$ is false when game is empty or invalid', () => {
        const app = new DefaultApp();
        const game = peek(app.game$);

        expect(peek(app.canStart$)).toEqual(false);

        game?.cells[0].toggleContents(1);
        expect(peek(app.canStart$)).toEqual(true);

        game?.cells[1].toggleContents(1);
        expect(peek(app.canStart$)).toEqual(false);
    });

    test('startGame() replaces the game with the same contents but locked', () => {
        const app = new DefaultApp();
        const initialGame = peek(app.game$);

        initialGame?.cells[0].toggleContents(1);
        initialGame?.cells[3].toggleContents(2);
        initialGame?.cells[40].toggleContents(3);

        app.startGame();

        const startedGame = peek(app.game$);

        expect(startedGame).not.toBe(initialGame);
        expect(startedGame?.getContents()).toEqual(initialGame?.getContents());
        expect(peek(startedGame?.cells[0].isLocked)).toEqual(true);
        expect(peek(startedGame?.cells[3].isLocked)).toEqual(true);
        expect(peek(startedGame?.cells[40].isLocked)).toEqual(true);
    });
});
