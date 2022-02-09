import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { BehaviorSubject } from 'rxjs';
import { useObservable } from 'src/RxPreact';
import { ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import 'src/UI/NumberPicker.css';

export const NumberPickerContext = createContext({
    selectedNumber$: new BehaviorSubject<ValidNumber>(1)
});

export interface NumberPickerStyle extends JSX.CSSProperties {
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
