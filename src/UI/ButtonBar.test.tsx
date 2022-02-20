import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'react';
import { Subject } from 'rxjs';
import { peek, Writeable } from 'src/RxReact';
import { SudokuGame } from 'src/Sudoku';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import { createMockSudokuApp } from 'src/SudokuApp/Mocks';
import { createTestProvider } from 'src/Test/TestContext';
import ButtonBar, { ButtonBarContext } from 'src/UI/ButtonBar';
import { SpyInstanceFn } from 'vitest';

let TestProvider: FunctionComponent;
let mockApp: Writeable<SudokuApp>;
let startGameSpy: SpyInstanceFn<[], void>;
let gameStatus$: Subject<SudokuGameStatus>;
let gameCanStart$: Subject<boolean>;
let shareSpy: SpyInstanceFn<[SudokuGame], void>;

function getStartButton() {
    return screen.getByTestId('button-bar-start');
}

function queryStartButton() {
    return screen.queryByTestId('button-bar-start');
}

function getNewGameButton() {
    return screen.getByTestId('button-bar-new');
}

function queryNewGameButton() {
    return screen.queryByTestId('button-bar-new');
}

function getResetGameButton() {
    return screen.getByTestId('button-bar-reset');
}

function queryResetGameButton() {
    return screen.queryByTestId('button-bar-reset');
}

function getShareButton() {
    return screen.getByTestId('button-bar-share');
}

beforeEach(() => {
    mockApp = createMockSudokuApp();
    shareSpy = vi.fn();
    [TestProvider] = createTestProvider(ButtonBarContext, {
        app: mockApp,
        share: shareSpy,
        saveLoadUndo: {
            undo: vi.fn(),
            redo: vi.fn(),
            setup: vi.fn()
        }
    });

    startGameSpy = mockApp.startGame;
    gameStatus$ = mockApp.status$;
    gameCanStart$ = mockApp.canStart$;

    render(
        <TestProvider>
            <ButtonBar></ButtonBar>
        </TestProvider>
    );

});

describe('Start Button', () => {

    it('disables Start button when canStart$ is false', () => {
        expect(getStartButton()).toBeDisabled();
    });

    it('it calls startGame when Start clicked and status is Creating', () => {
        act(() => {
            gameCanStart$.next(true);
        });

        userEvent.click(getStartButton());

        expect(startGameSpy).toHaveBeenCalled();
    });

    it('hides Start button when status is Solving or Solved', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
        });
        expect(queryStartButton()).not.toBeInTheDocument();

        act(() => {
            gameStatus$.next(SudokuGameStatus.Solved);
        });
        expect(queryStartButton()).not.toBeInTheDocument();
    });
});

describe('New Game Button', () => {
    it('calls newGame when New Game button clicked', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
        });

        userEvent.click(getNewGameButton());
        expect(mockApp.newGame).toHaveBeenCalled();
    });

    it('hides New Game when status is Creating', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Creating);
        });

        expect(queryNewGameButton()).not.toBeInTheDocument();
    });

    it('hides New Game when reset button is showing instead', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
            mockApp.canReset$.next(true);
        });

        expect(queryNewGameButton()).not.toBeInTheDocument();
    });
});

describe('Reset Game Button', () => {
    it('calls resetGame when Reset Game button clicked', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
            mockApp.canReset$.next(true);
        });

        userEvent.click(getResetGameButton());
        expect(mockApp.resetGame).toHaveBeenCalled();
    });

    it('hides Reset Game when status is Creating', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Creating);
        });

        expect(queryResetGameButton()).not.toBeInTheDocument();
    });

    it('hides Reset Game when canReset$ is false', () => {
        expect(queryResetGameButton()).not.toBeInTheDocument();
    });
});

describe('Share Button', () => {
    it('calls shareGame when clicked', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
        });

        userEvent.click(getShareButton());
        expect(shareSpy).toHaveBeenCalledWith(peek(mockApp.game$));
        expect(getShareButton()).not.toBeDisabled();
    });

    it('is disabled when Creating', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Creating);
        });

        expect(getShareButton()).toBeDisabled();

        act(() => {
            gameStatus$.next(SudokuGameStatus.Solved);
        });

        expect(getShareButton()).not.toBeDisabled();
    });
});
