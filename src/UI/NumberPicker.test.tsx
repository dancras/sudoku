import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'react';
import { BehaviorSubject } from 'rxjs';
import { CandidateColor, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import { createTestProvider } from 'src/Test/TestContext';
import NumberPicker, { NumberPickerContext } from 'src/UI/NumberPicker';

let TestProvider: FunctionComponent;

beforeEach(() => {
    [TestProvider] = createTestProvider(NumberPickerContext, {
        selectedNumber$: new BehaviorSubject<ValidNumber>(1),
        currentColor$: new BehaviorSubject<CandidateColor>('a')
    });

    render(
        <TestProvider>
            <NumberPicker />
        </TestProvider>
    );
});


test('numbers 1 to 9 are displayed', () => {
    VALID_NUMBERS.forEach(x => expect(screen.getByText(x)).toBeInTheDocument());
});


test('the --value css variable is set on number elements', () => {
    expect(screen.getByText(2).getAttribute('style')).toContain('--value: 2');
});


test('the --selected css variable is updated when an option is clicked', function () {
    const option3 = screen.getByText(3);
    const selection = screen.getByTestId('number-picker-selection');

    expect(selection.getAttribute('style')).toContain('--selected: 1');

    userEvent.click(option3);

    expect(selection.getAttribute('style')).toContain('--selected: 3');
});


test('the data-current-color attribute is toggled when already selected option is clicked', function () {
    const option1 = screen.getByText(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const picker = screen.getByTestId('number-picker-selection').parentElement!;

    expect(picker.getAttribute('data-current-color')).toContain('a');

    userEvent.click(option1);

    expect(picker.getAttribute('data-current-color')).toContain('b');

    userEvent.click(option1);

    expect(picker.getAttribute('data-current-color')).toContain('c');

    userEvent.click(option1);

    expect(picker.getAttribute('data-current-color')).toContain('a');
});
