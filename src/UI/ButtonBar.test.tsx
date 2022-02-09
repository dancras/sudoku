import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'preact';
import { act } from 'preact/test-utils';
import { BehaviorSubject } from 'rxjs';
import { Writeable } from 'src/RxPreact';
import { createSudokuGame } from 'src/Sudoku';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import { createTestProvider } from 'src/Test/TestContext';
import ButtonBar, { ButtonBarContext } from 'src/UI/ButtonBar';
import { SpyInstanceFn } from 'vitest';

describe('Start Button', () => {

    let TestProvider: FunctionComponent;
    let startGameSpy: SpyInstanceFn<[], void>;
    let gameStatus$: BehaviorSubject<SudokuGameStatus>;
    let gameCanStart$: BehaviorSubject<boolean>;

    beforeEach(() => {
        [TestProvider] = createTestProvider(ButtonBarContext, {
            app: {
                status$: gameStatus$ = new BehaviorSubject<SudokuGameStatus>(SudokuGameStatus.Creating),
                game$: new BehaviorSubject(createSudokuGame()),
                canStart$: gameCanStart$ = new BehaviorSubject<boolean>(false),
                startGame: startGameSpy = vi.fn()
            } as Writeable<SudokuApp>
        });

        render(
            <TestProvider>
                <ButtonBar></ButtonBar>
            </TestProvider>
        );

    });

    it('it is disabled when canStart$ is false', () => {
        expect(screen.getByText('Start')).toBeDisabled();
    });

    it('it calls startGame when clicked and status is Creating', () => {
        act(() => {
            gameCanStart$.next(true);
        });

        userEvent.click(screen.getByText('Start'));

        expect(startGameSpy).toHaveBeenCalled();
    });

    it('it is not present when status is Solving or Solved', () => {
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
