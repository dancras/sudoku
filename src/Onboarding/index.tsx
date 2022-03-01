import { Persistence } from '@vitorluizc/persistence';
import { ReactFragment } from 'react';
import { debounceTime, map, merge, startWith, Subject, switchMap, withLatestFrom } from 'rxjs';
import { SudokuGameUpdate } from 'src/Sudoku';
import { SudokuApp, SudokuAppUpdate, SudokuGameStatus } from 'src/SudokuApp';
import { MessageArrow, MessageData } from 'src/UI/Messages';

export type OnboardingStorageSchema = {
    seen: Record<string, boolean>
}

function isTouchScreen() {
    return window.matchMedia('(hover: none)').matches;
}

type OnboardingUpdate = {
    type: 'GameUpdate',
    detail: SudokuGameUpdate
} | {
    type: 'AppUpdate',
    detail: SudokuAppUpdate
} | {
    type: 'InitialUpdate'
};

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
        map(update => ({
            type: 'GameUpdate',
            detail: update
        } as OnboardingUpdate))
    );

    const gameIsValid$ = app.game$.pipe(
        switchMap(game => game.isValid$),
    );

    const appUpdates$ = app.updates$.pipe(
        map(update => ({
            type: 'AppUpdate',
            detail: update
        } as OnboardingUpdate))
    );

    const tapOrClick = <i>{ isTouchScreen() ? 'Tap' : 'Click' }</i>;
    const doubleTapOrClick = <i>{ isTouchScreen() ? 'Double Tap' : 'Double Click' }</i>;
    const tappingOrClicking = <i>{ isTouchScreen() ? 'Tapping' : 'Clicking' }</i>;
    const deviceOrComputer = isTouchScreen() ? 'phone or tablet' : 'computer';

    addMessage('welcome', <>
        <p>Welcome to my Sudoku app.</p>
        <p>I&apos;ll be sharing a few details the first time you encounter things.</p>
        <p>{ tapOrClick } anywhere to dismiss a message.</p>
    </>);

    addMessage('about', <>
        <p>The app has no puzzles of its own.</p>
        <p>Instead you can use it to play puzzles from newspapers, sudoku books or other websites.</p>
    </>);

    merge(
        appUpdates$,
        gameUpdates$,
    ).pipe(
        startWith({
            type: 'InitialUpdate'
        } as OnboardingUpdate),
        debounceTime(0),
        withLatestFrom(app.status$, gameIsValid$),
    ).subscribe(([update, status, gameIsValid]) => {
        let appUpdate: SudokuAppUpdate | undefined;
        let gameUpdate: SudokuGameUpdate | undefined;

        if (update.type === 'AppUpdate') {
            appUpdate = update.detail;
        } else if (update.type === 'GameUpdate') {
            gameUpdate = update.detail;
        }

        if (status === SudokuGameStatus.Creating) {

            addMessage('create_start', <>
                <p>Right now you&apos;re in <b>Create Mode</b>.</p>
                <p>Here you can add a puzzle to play and share.</p>
            </>);

            addMessage('photo_import', <>
                <p>The easiest way is by <b>Photo Import</b>.</p>
                <p>You can take a photo or choose an image of a Sudoku Grid.</p>
                <p>The entire grid must be in the photo or stange things might happen..</p>
            </>);

            addMessage('photo_import_button',
                <p>{ tapOrClick } the camera icon to use it.</p>
                , {
                    target: 'ButtonBar',
                    button: 2
                }
            );

            addMessage('create_manual',
                <p>Otherwise you can edit the grid manually.</p>
            );

            addMessage('create_choose_number',
                <p>Start by { tappingOrClicking } a number to select it.</p>
                , {
                    target: 'NumberPicker'
                }
            );

            addMessage('create_toggle_cell',
                <p>Then { tapOrClick } a cell to add or remove that number.</p>
                , {
                    target: 'SudokuGrid'
                }
            );
        }

        if (appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === false) {

            addMessage('photo_import_complete', <>
                <p>Your { deviceOrComputer } has just trained a simple AI to understand the photo in real time.</p>
            </>);

            if (gameIsValid) {
                addMessage('photo_import_promising', <>
                    <p>It does looks promising but it&apos;s best to check it over.</p>
                </>);

                addMessage('photo_import_take_again', <>
                    <p>If it&apos;s miles off you can try taking the photo again.</p>
                </>);
            } else {
                addMessage('photo_import_take_again', <>
                    <p>It seems you have some errors. Maybe try taking the photo again.</p>
                </>);
            }

            addMessage('photo_import_errors_advice', <>
                <p>For best results keep the grid straight and centered.</p>
                <p>If it&apos;s from a screen, try zooming in and taking the photo from further away.</p>
            </>);

            addMessage('photo_import_errors_fix',
                <p>Sometimes it&apos;s quicker to correct a few numbers manually.</p>
            );
        }

        if (
            gameIsValid && appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === false ||
            gameIsValid && gameUpdate !== undefined && status === SudokuGameStatus.Creating
        ) {
            addMessage('start_game_button',
                <p>This is the <b>Start Game Button</b> for when you are done creating.</p>
                , {
                    target: 'ButtonBar',
                    button: 1
                }
            );
        }

        if (gameUpdate !== undefined) {
            addMessage('undo_redo', <>
                <p>The <b>Undo and Redo Buttons</b> are available to correct errors.</p>
                <p>They even work if you start or clear the game.</p>
            </>, {
                target: 'ButtonBar',
                button: 0,
                otherButton: 3
            });
        }

        if (appUpdate && appUpdate.type === 'LoadGameUpdate' && appUpdate.startGame === true) {
            addMessage('arrive_from_link',
                <p>You&apos;ve arrived from a shared puzzle link so you can start solving right away.</p>
            );
        }

        if (appUpdate && appUpdate.type === 'StartGameUpdate') {
            addMessage('start_game',
                <p>The puzzle cells are now locked and you&apos;re in <b>Solve Mode</b>.</p>
            );
        }

        if (status === SudokuGameStatus.Solving) {
            addMessage('solving_choose_number',
                <p>Start by { tappingOrClicking } a number to select it.</p>
                , {
                    target: 'NumberPicker'
                }
            );

            addMessage('solving_toggle_cell_candidate', <>
                <p>{ tapOrClick } a cell to add or remove the chosen number as a Candidate.</p>
            </>, {
                target: 'SudokuGrid'
            });

            addMessage('solving_toggle_cell_solution', <>
                <p>{ doubleTapOrClick } to add or remove the chosen number as a Solution.</p>
            </>, {
                target: 'SudokuGrid'
            });
        }

        if (gameUpdate !== undefined && gameUpdate.type === 'CellUpdate' && status === SudokuGameStatus.Solving) {
            addMessage('reset_button', <>
                <p>The <b>Reset Button</b> will start the puzzle again.</p>
                <p>{ tapOrClick } it twice to go back to Create Mode.</p>
                <p>These actions can be undone.</p>
            </>, {
                target: 'ButtonBar',
                button: 1
            });

            addMessage('save_progress', <>
                <p>Your progress is being saved so you can continue later if you need to.</p>
                <p>You can even play when you are offline.</p>
            </>);

            addMessage('share_button', <>
                <p>{ tapOrClick } the <b>Share Button</b> any time to share puzzles with friends.</p>
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
                <p>The <b>Bin Button</b> will clear the grid and return to Create Mode.</p>
            </>, {
                target: 'ButtonBar',
                button: 1
            });

            addMessage('final_share',
                <p>Maybe you want to <b>Share</b> the puzzle before you do that?</p>
                , {
                    target: 'ButtonBar',
                    button: 2
                }
            );
        }

    });

}


