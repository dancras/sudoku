import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'preact';
import { BehaviorSubject } from 'rxjs';
import { createTestProvider } from 'src/Test/TestContext';
import NumberPicker, { NumberPickerContext, NUMBER_PICKER_OPTIONS } from 'src/UI/NumberPicker';

let TestProvider: FunctionComponent;

beforeEach(() => {
    [TestProvider] = createTestProvider(NumberPickerContext, {
        selectedNumber$: new BehaviorSubject(1)
    });

    render(
        <TestProvider>
            <NumberPicker />
        </TestProvider>
    );
});


test('numbers 1 to 9 are displayed', () => {
    NUMBER_PICKER_OPTIONS.forEach(x => expect(screen.getByText(x)).toBeInTheDocument());
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
