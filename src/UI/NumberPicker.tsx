import { useContext } from 'react';
import { BehaviorSubject } from 'rxjs';
import { defineDependencies, useObservable } from 'src/RxReact';
import { AVAILABLE_COLORS, CandidateColor, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import 'src/UI/NumberPicker.css';

const NEXT_COLOR_MAP = Object.fromEntries(AVAILABLE_COLORS.map(
    (color, i) => [color, AVAILABLE_COLORS[(i + 1) % AVAILABLE_COLORS.length]]
));

export const NumberPickerContext = defineDependencies<{
    selectedNumber$: BehaviorSubject<ValidNumber>,
    currentColor$: BehaviorSubject<CandidateColor>
}>();

export interface NumberPickerStyle extends React.CSSProperties {
    '--selected'?: number;
    '--value'?: number;
}

export default function NumberPicker() {
    const { selectedNumber$, currentColor$ } = useContext(NumberPickerContext);
    const selectedNumber = useObservable(selectedNumber$);
    const currentColor = useObservable(currentColor$);

    const handleUpdate = (x: ValidNumber) => {
        if (selectedNumber$.value === x) {
            currentColor$.next(NEXT_COLOR_MAP[currentColor$.value]);
        } else {
            selectedNumber$.next(x);
        }
    };

    return (
        <div className="NumberPicker" data-current-color={currentColor}>
            <div style={{ '--selected': selectedNumber } as NumberPickerStyle}
                 className="--Selection"
                 data-testid="number-picker-selection"
            ></div>
            <ul className="--Values">
                {VALID_NUMBERS.map(x =>
                    <li key={x}
                        onClick={() => handleUpdate(x)}
                        style={{ '--value': x } as NumberPickerStyle}
                    >
                        {x}
                    </li>
                )}
            </ul>
        </div>
    );
}
