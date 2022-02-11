import { useContext } from 'react';
import { BehaviorSubject } from 'rxjs';
import { defineDependencies, useObservable } from 'src/RxReact';
import { ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import 'src/UI/NumberPicker.css';

export const NumberPickerContext = defineDependencies<{
    selectedNumber$: BehaviorSubject<ValidNumber>
}>();

export interface NumberPickerStyle extends React.CSSProperties {
    '--selected'?: number;
    '--value'?: number;
}

export default function NumberPicker() {
    const { selectedNumber$ } = useContext(NumberPickerContext);
    const selectedNumber = useObservable(selectedNumber$);

    return (
        <div className="NumberPicker">
            <div style={{ '--selected': selectedNumber } as NumberPickerStyle}
                 className="--Selection"
                 data-testid="number-picker-selection"
            ></div>
            <ul className="--Values">
                {VALID_NUMBERS.map(x =>
                    <li key={x}
                        onClick={() => selectedNumber$.next(x)}
                        style={{ '--value': x } as NumberPickerStyle}
                    >
                        {x}
                    </li>
                )}
            </ul>
        </div>
    );
}
