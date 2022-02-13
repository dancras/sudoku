import { useContext } from 'react';
import { defineDependencies, useObservable } from 'src/RxReact';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import 'src/UI/ButtonBar.css';

export const ButtonBarContext = defineDependencies<{
    app: SudokuApp
}>();

export default function ButtonBar() {
    const { app } = useContext(ButtonBarContext);
    const status = useObservable(app.status$);
    const canStart = useObservable(app.canStart$);
    const canReset = useObservable(app.canReset$);

    const showStartButton = status === SudokuGameStatus.Creating;
    const showNewGameButton = status !== SudokuGameStatus.Creating && !canReset;
    const showResetGameButton = status !== SudokuGameStatus.Creating && canReset;

    return (
        <div className="ButtonBar">
            { showStartButton && <button disabled={ !canStart } onClick={() =>  app.startGame()}>Start</button> }
            { showNewGameButton && <button onClick={() => app.newGame()}>New Game</button> }
            { showResetGameButton && <button onClick={() => app.resetGame()}>Reset Game</button> }
        </div>
    );
}
