import { useContext } from 'react';
import { defineDependencies, useObservable } from 'src/RxReact';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';

export const ButtonBarContext = defineDependencies<{
    app: SudokuApp
}>();

export default function ButtonBar() {
    const { app } = useContext(ButtonBarContext);
    const status = useObservable(app.status$);
    const canStart = useObservable(app.canStart$);

    const showStartButton = status === SudokuGameStatus.Creating;

    return (
        <div className="ButtonBar">
            { showStartButton && <button disabled={ !canStart } onClick={ () => app.startGame() }>Start</button> }
        </div>
    );
}
