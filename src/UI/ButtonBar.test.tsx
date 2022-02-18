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

beforeEach(() => {
    mockApp = createMockSudokuApp();
    shareSpy = vi.fn();
    [TestProvider] = createTestProvider(ButtonBarContext, {
        app: mockApp,
        share: shareSpy
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
        expect(screen.getByText('Start')).toBeDisabled();
    });

    it('it calls startGame when Start clicked and status is Creating', () => {
        act(() => {
            gameCanStart$.next(true);
        });

        userEvent.click(screen.getByText('Start'));

        expect(startGameSpy).toHaveBeenCalled();
    });

    it('hides Start button when status is Solving or Solved', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
        });
        expect(screen.queryByText('Start')).not.toBeInTheDocument();

        act(() => {
            gameStatus$.next(SudokuGameStatus.Solved);
        });
        expect(screen.queryByText('Start')).not.toBeInTheDocument();
    });
});

describe('New Game Button', () => {
    it('calls newGame when New Game button clicked', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
        });

        userEvent.click(screen.getByText('New Game'));
        expect(mockApp.newGame).toHaveBeenCalled();
    });

    it('hides New Game when status is Creating', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Creating);
        });

        expect(screen.queryByText('New Game')).not.toBeInTheDocument();
    });

    it('hides New Game when reset button is showing instead', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
            mockApp.canReset$.next(true);
        });

        expect(screen.queryByText('New Game')).not.toBeInTheDocument();
    });
});

describe('Reset Game Button', () => {
    it('calls resetGame when Reset Game button clicked', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
            mockApp.canReset$.next(true);
        });

        userEvent.click(screen.getByText('Reset Game'));
        expect(mockApp.resetGame).toHaveBeenCalled();
    });

    it('hides Reset Game when status is Creating', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Creating);
        });

        expect(screen.queryByText('Reset Game')).not.toBeInTheDocument();
    });

    it('hides Reset Game when canReset$ is false', () => {
        expect(screen.queryByText('Reset Game')).not.toBeInTheDocument();
    });
});

describe('Share Button', () => {
    it('calls shareGame when clicked', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Solving);
        });

        userEvent.click(screen.getByText('Share'));
        expect(shareSpy).toHaveBeenCalledWith(peek(mockApp.game$));
    });

    it('is not showing when Creating', () => {
        act(() => {
            gameStatus$.next(SudokuGameStatus.Creating);
        });

        expect(screen.queryByText('Share')).not.toBeInTheDocument();

        act(() => {
            gameStatus$.next(SudokuGameStatus.Solved);
        });

        expect(screen.queryByText('Share')).toBeInTheDocument();
    });
});
