import createPersistence from '@vitorluizc/persistence';
import { BehaviorSubject } from 'rxjs';
import { OnboardingStorageSchema } from 'src/Onboarding';
import { createSaveLoadUndo, StorageSchema } from 'src/SaveLoadUndo';
import { CandidateColor, ValidNumber } from 'src/Sudoku';
import { createSudokuApp } from 'src/SudokuApp';
import { createMessagesModel } from 'src/UI/Messages';

export function createCompositionContext() {
    const selectedNumber$ = new BehaviorSubject<ValidNumber>(1);
    const currentColor$ = new BehaviorSubject<CandidateColor>('a');
    const app = createSudokuApp();
    const saveLoadUndoStorage = createPersistence<StorageSchema>('SaveLoadUndo');
    const onboardingStorage = createPersistence<OnboardingStorageSchema>('Onboarding');
    const saveLoadUndo = createSaveLoadUndo(saveLoadUndoStorage, app);
    const { messages$, message$, dismiss$ } = createMessagesModel();

    return {
        selectedNumber$,
        currentColor$,
        app,
        saveLoadUndoStorage,
        saveLoadUndo,
        onboardingStorage,
        messages$,
        message$,
        dismiss$
    };
}
