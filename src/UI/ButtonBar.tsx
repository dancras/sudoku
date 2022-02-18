import { useContext } from 'react';
import { defineDependencies, useObservable } from 'src/RxReact';
import { SudokuGame } from 'src/Sudoku';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import 'src/UI/ButtonBar.css';

export const ButtonBarContext = defineDependencies<{
    app: SudokuApp,
    share: (game: SudokuGame) => void
}>();

export default function ButtonBar() {
    const { app, share } = useContext(ButtonBarContext);
    const status = useObservable(app.status$);
    const canStart = useObservable(app.canStart$);
    const canReset = useObservable(app.canReset$);
    const game = useObservable(app.game$);

    const showStartButton = status === SudokuGameStatus.Creating;
    const showNewGameButton = status !== SudokuGameStatus.Creating && !canReset;
    const showResetGameButton = status !== SudokuGameStatus.Creating && canReset;
    const showShareButton = status !== SudokuGameStatus.Creating;

    return (
        <div className="ButtonBar">
            { showStartButton && <button disabled={ !canStart } onClick={() =>  app.startGame()}>Start</button> }
            { showNewGameButton && <button onClick={() => app.newGame()}>New Game</button> }
            { showResetGameButton && <button onClick={() => app.resetGame()}>Reset Game</button> }
            { showShareButton && <button onClick={() => share(game)}>Share</button> }
        </div>
    );
}
