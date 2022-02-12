import NoSleep from 'nosleep.js';
import { useContext } from 'react';
import { defineDependencies, useObservable } from 'src/RxReact';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import 'src/UI/ButtonBar.css';

let noSleep = {
    enable() {
        // Do nothing in tests
    }
};

if (!navigator.userAgent.includes('jsdom')) {
    noSleep = new NoSleep();
}

export const ButtonBarContext = defineDependencies<{
    app: SudokuApp
}>();

export default function ButtonBar() {
    const { app } = useContext(ButtonBarContext);
    const status = useObservable(app.status$);
    const canStart = useObservable(app.canStart$);

    const showStartButton = status === SudokuGameStatus.Creating;

    function handleClick() {
        app.startGame();

        if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID === undefined) {
            noSleep.enable();
        }
    }

    return (
        <div className="ButtonBar">
            { showStartButton && <button disabled={ !canStart } onClick={ handleClick }>Start</button> }
        </div>
    );
}
