import { Persistence } from '@vitorluizc/persistence';
import { ReactFragment } from 'react';
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

    function addMessage(key: string, body: ReactFragment, arrow?: MessageArrow) {
        if (!seen[key]) {
            messages$.next({
                body,
                mustDismiss: true,
                arrow,
                onRender: () => {
                    seen[key] = true;
                    storage.set({ seen });
                }
            });
        }
    }

    const gameUpdates$ = app.game$.pipe(
        switchMap(game => game.updates$),
        startWith(undefined)
    );

    const appUpdates$ = app.updates$.pipe(startWith(undefined));

    let solvingUpdates = 0;

    addMessage('welcome', <>
        <p>Welcome to my Sudoku app.</p>
        <p>I&apos;ll be sharing a few details the first time you encounter things.</p>
        <p><i>Tap or Click</i> anywhere to dismiss a message.</p>
    </>);

    addMessage('about', <>
        <p>The app has no puzzles of its own.</p>
        <p>Instead you can use it to play puzzles from newspapers, sudoku books or other websites.</p>
    </>);

    combineLatest([app.status$, appUpdates$, gameUpdates$]).pipe(
        debounceTime(0)
    ).subscribe(([status, appUpdate, gameUpdate]) => {

        if (gameUpdate !== undefined && status === SudokuGameStatus.Solving) {
            solvingUpdates++;
        }

        if (status === SudokuGameStatus.Creating) {

            addMessage('create_start', <>
                <p>Right now you&apos;re in Create Mode.</p>
                <p>Here you can add a puzzle to play and share.</p>
            </>);

            addMessage('photo_upload', <>
                <p>The easiest way is by photo upload.</p>
                <p>You can take a photo or upload an image of a Sudoku Grid.</p>
                <p>The entire grid must be in the photo or stange things might happen..</p>
            </>);

            addMessage('photo_upload_button',
                <p>Tap or Click the camera icon to use it.</p>
                , {
                    target: 'ButtonBar',
                    button: 2
                }
            );

            addMessage('create_manual',
                <p>Otherwise you can edit the grid directly.</p>
            );

            addMessage('create_choose_number',
                <p>Start by choosing a number.</p>
                , {
                    target: 'NumberPicker'
                }
            );

            addMessage('create_toggle_cell',
                <p>Then Tap or Click a cell to toggle it on or off.</p>
                , {
                    target: 'SudokuGrid'
                }
            );
        }

        if (appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === false) {
            addMessage('photo_upload_complete', <>
                <p>Your Phone or Computer has just trained a simple AI to understand the photo in real time.</p>
                <p>First check that it&apos;s done a good job.</p>
            </>);

            addMessage('photo_upload_advice', <>
                <p>For best results keep the grid straight and centered.</p>
                <p>Try taking it from further away if it&apos;s on a screen.</p>
            </>);

            addMessage('photo_upload_fix',
                <p>You can always fix any missing or incorrect parts manually before Starting.</p>
            );
        }

        if (
            appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === false ||
            gameUpdate !== undefined && status === SudokuGameStatus.Creating
        ) {
            addMessage('start_game_button',
                <p>This is the Start Game button for when you are done creating.</p>
                , {
                    target: 'ButtonBar',
                    button: 1
                }
            );
        }

        if (gameUpdate !== undefined) {
            addMessage('undo_redo', <>
                <p>The Undo and Redo buttons are available to correct errors.</p>
                <p>They even work if you Start or Clear the game</p>
            </>, {
                target: 'ButtonBar',
                button: 0,
                otherButton: 3
            });
        }

        if (appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === true) {
            addMessage('arrive_from_link',
                <p>You&apos;ve arrived from a shared Puzzle link so you can start solving right away.</p>
            );
        }

        if (appUpdate && appUpdate.type === 'StartGameUpdate') {
            addMessage('start_game',
                <p>The puzzle cells are now locked and you&apos;re in Solve Mode.</p>
            );
        }

        if (status === SudokuGameStatus.Solving) {
            addMessage('solving_choose_number',
                <p>Start by choosing a number.</p>
                , {
                    target: 'NumberPicker'
                }
            );

            addMessage('solving_toggle_cell', <>
                <p>Tap or Click a Cell to add or remove the chosen number as a Candidate.</p>
                <p>Double Tap or Click to solve the cell with the chosen number.</p>
            </>, {
                target: 'SudokuGrid'
            });
        }

        if (gameUpdate !== undefined && gameUpdate.type === 'CellUpdate' && status === SudokuGameStatus.Solving) {
            addMessage('reset_button', <>
                <p>The Reset button will start the puzzle again.</p>
                <p>Tap or Click it twice to go back to Create Mode.</p>
                <p>These actions can be undone.</p>
            </>, {
                target: 'ButtonBar',
                button: 1
            });
        }

        if (solvingUpdates === 10) {
            addMessage('save_progress', <>
                <p>Your progress is being saved so you can continue later if you need to.</p>
                <p>You can even play when you are offline.</p>
            </>);
        }

        if (solvingUpdates === 20) {
            addMessage('share_button', <>
                <p>Tap or Click the Share button any time to share puzzles with friends.</p>
                <p>Shared puzzles won&apos;t include any of your current progress.</p>
                <p>I&apos;ll leave you in peace now. Enjoy!</p>
            </>, {
                target: 'ButtonBar',
                button: 2
            });
        }

        if (status === SudokuGameStatus.Solved) {
            addMessage('complete', <>
                <p>All done. I hope this first puzzle was a smooth experience.</p>
                <p>This button will clear the grid and return to Create Mode.</p>
            </>, {
                target: 'ButtonBar',
                button: 1
            });

            addMessage('final_share',
                <p>Maybe you want to share the puzzle before you do that?</p>
                , {
                    target: 'ButtonBar',
                    button: 2
                }
            );
        }

    });

}


