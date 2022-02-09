import { peek } from 'src/RxPreact';
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
});
