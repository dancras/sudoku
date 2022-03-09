import NoSleep from 'nosleep.js';
import { useEffect } from 'react';
import { CompositionRoot, createCompositionContext } from 'src/Composition';
import { setupOnboarding } from 'src/Onboarding';
import { loadSharedGame } from 'src/Share/FragmentShare';
import 'src/SudokuApp.css';
import ButtonBar from 'src/UI/ButtonBar';
import Messages from 'src/UI/Messages';
import NumberPicker from 'src/UI/NumberPicker';
import SudokuGrid from 'src/UI/SudokuGrid';

let noSleep = {
    enable() {
        // Do nothing in tests
    }
};

if (!navigator.userAgent.includes('jsdom')) {
    noSleep = new NoSleep();
}

function AppMain() {
    const context = createCompositionContext();
    const {
        saveLoadUndo,
        onboardingStorage,
        messages$,
        app
    } = context;

    useEffect(() => {
        saveLoadUndo.setup();
        setupOnboarding(onboardingStorage, messages$, app);
        loadSharedGame(app);
    }, []);

    function handleClick() {
        noSleep.enable();
    }

    return (
        <CompositionRoot context={context}>
            <div className="SudokuApp" onClick={handleClick}>
                <Messages></Messages>
                <SudokuGrid />
                <NumberPicker />
                <ButtonBar />
            </div>
        </CompositionRoot>
    );
}

export default AppMain;
