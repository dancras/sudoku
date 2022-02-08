import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { BehaviorSubject } from 'rxjs';
import { useObservable } from 'src/RxPreact';
import 'src/UI/NumberPicker.css';

export const NUMBER_PICKER_OPTIONS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const NumberPickerContext = createContext({
    selectedNumber$: new BehaviorSubject<number>(0)
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
                {NUMBER_PICKER_OPTIONS.map(x =>
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
