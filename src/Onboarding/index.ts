import { Persistence } from '@vitorluizc/persistence';
import { combineLatest, debounceTime, startWith, Subject, switchMap } from 'rxjs';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import { MessageArrow, MessageData } from 'src/UI/Messages';

export type OnboardingStorageSchema = {
    seen: Record<string, boolean>
}

export function setupOnboarding(
    storage: Persistence<OnboardingStorageSchema>,
    messages$: Subject<MessageData>,
    app: SudokuApp
) {

    const seen: Record<string, boolean> = storage.get()?.seen || {};

    function addMessage(key: string, text: string[], arrow?: MessageArrow) {
        if (!seen[key]) {
            seen[key] = true;
            storage.set({ seen });
            messages$.next({
                text,
                mustDismiss: true,
                arrow
            });
        }
    }

    const gameUpdates$ = app.game$.pipe(
        switchMap(game => game.updates$),
        startWith(undefined)
    );

    const appUpdates$ = app.updates$.pipe(startWith(undefined));

    let solvingUpdates = 0;

    addMessage('welcome', [
        'Welcome to my Sudoku app.',
        'I\'ll be sharing a few details the first time you encounter things.',
        'Tap or Click anywhere to dismiss a message.'
    ]);

    addMessage('about', [
        'The app has no puzzles of its own.',
        'Instead you can use it to play puzzles from newspapers, sudoku books or other websites.'
    ]);

    combineLatest([app.status$, appUpdates$, gameUpdates$]).pipe(
        debounceTime(0)
    ).subscribe(([status, appUpdate, gameUpdate]) => {

        if (gameUpdate !== undefined && status === SudokuGameStatus.Solving) {
            solvingUpdates++;
        }

        if (status === SudokuGameStatus.Creating) {

            addMessage('create_start', [
                'Right now you\'re in Create Mode.',
                'Here you can add a puzzle to play and share.'
            ]);

            addMessage('photo_upload', [
                'The easiest way is by photo upload.',
                'You can take a photo or upload an image of a Sudoku Grid.',
                'The entire grid must be in the photo or stange things might happen..'
            ]);

            addMessage('photo_upload_button', [
                'Tap or Click the camera icon to use it.'
            ], {
                target: 'ButtonBar',
                button: 2
            });

            addMessage('create_manual', [
                'Otherwise you can edit the grid directly.',
            ]);

            addMessage('create_choose_number', [
                'Start by choosing a number.',
            ], {
                target: 'NumberPicker'
            });

            addMessage('create_toggle_cell', [
                'Then Tap or Click a cell to toggle it on or off.',
            ], {
                target: 'SudokuGrid'
            });
        }

        if (appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === false) {
            addMessage('photo_upload_complete', [
                'Your Phone or Computer has just trained a simple AI to understand the photo in real time.',
                'First check that it\'s done a good job.'
            ]);

            addMessage('photo_upload_advice', [
                'For best results keep the grid straight and centered.',
                'Try taking it from further away if it\'s on a screen.'
            ]);

            addMessage('photo_upload_fix', [
                'You can always fix any missing or incorrect parts manually before Starting.',
            ]);
        }

        if (
            appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === false ||
            gameUpdate !== undefined && status === SudokuGameStatus.Creating
        ) {
            addMessage('start_game_button', [
                'This is the Start Game button for when you are done creating.',
            ], {
                target: 'ButtonBar',
                button: 1
            });
        }

        if (gameUpdate !== undefined) {
            addMessage('undo_redo', [
                'The Undo and Redo buttons are available to correct errors.',
                'They even work if you Start or Clear the game'
            ], {
                target: 'ButtonBar',
                button: 0,
                otherButton: 3
            });
        }

        if (appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === true) {
            addMessage('arrive_from_link', [
                'You\'ve arrived from a shared Puzzle link so you can start solving right away.',
            ]);
        }

        if (appUpdate && appUpdate.type === 'StartGameUpdate') {
            addMessage('start_game', [
                'The puzzle cells are now locked and you\'re in Solve Mode.',
            ]);
        }

        if (status === SudokuGameStatus.Solving) {
            addMessage('solving_choose_number', [
                'Start by choosing a number.',
            ], {
                target: 'NumberPicker'
            });

            addMessage('solving_toggle_cell', [
                'Tap or Click a Cell to add or remove the chosen number as a Candidate.',
                'Double Tap or Click to solve the cell with the chosen number.',
            ], {
                target: 'SudokuGrid'
            });
        }

        if (gameUpdate !== undefined && gameUpdate.type === 'CellUpdate' && status === SudokuGameStatus.Solving) {
            addMessage('reset_button', [
                'The Reset button will start the puzzle again.',
                'Tap or Click it twice to go back to Create Mode.',
                'These actions can be undone.'
            ], {
                target: 'ButtonBar',
                button: 1
            });
        }

        if (solvingUpdates === 10) {
            addMessage('save_progress', [
                'Your progress is being saved so you can continue later if you need to.',
                'You can even play when you are offline.'
            ]);
        }

        if (solvingUpdates === 20) {
            addMessage('share_button', [
                'Tap or Click the Share button any time to share puzzles with friends.',
                'Shared puzzles won\'t include any of your current progress.',
                'I\'ll leave you in peace now. Enjoy!'
            ], {
                target: 'ButtonBar',
                button: 2
            });
        }

        if (status === SudokuGameStatus.Solved) {
            addMessage('complete', [
                'All done. I hope this first puzzle was a smooth experience.',
                'This button will clear the grid and return to Create Mode.'
            ], {
                target: 'ButtonBar',
                button: 1
            });

            addMessage('final_share', [
                'Maybe you want to share the puzzle before you do that?',
            ], {
                target: 'ButtonBar',
                button: 2
            });
        }

    });

}


