import { useEffect, useMemo } from 'react';
import { CompositionRoot, createCompositionContext } from 'src/Composition';
import { setupOnboarding } from 'src/Onboarding';
import { loadSharedGame } from 'src/Share/FragmentShare';
import 'src/SudokuApp.css';
import ButtonBar from 'src/UI/ButtonBar';
import Messages from 'src/UI/Messages';
import NumberPicker from 'src/UI/NumberPicker';
import SudokuGrid from 'src/UI/SudokuGrid';

let wakeLock: WakeLockSentinel | null = null;
let wakeLockEnabled = false;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                wakeLock = null;
            });
        } catch {
            // Wake lock request failed or denied (e.g. low battery, background tab)
        }
    }
}

function AppMain() {
    const context = useMemo(() => createCompositionContext(), []);
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

        const handleVisibilityChange = async () => {
            if (wakeLockEnabled && document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, [app, messages$, onboardingStorage, saveLoadUndo]);

    function handleClick() {
        wakeLockEnabled = true;
        if (!wakeLock) {
            requestWakeLock();
        }
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
