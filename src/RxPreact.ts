import { useEffect, useRef, useState } from 'preact/hooks';
import { firstValueFrom, Observable, ObservableInput, of, Subject, withLatestFrom } from 'rxjs';
import { SpyInstanceFn } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Writeable<T> =
    (T extends Subject<any> ? T :
        (T extends Observable<infer C> ? Subject<C> :
            (T extends (...args: infer A) => infer R ? SpyInstanceFn<A, R> :
                (T extends { [K in keyof T]: any } ? { [K in keyof T]: Writeable<T[K]> } :
                    T
                )
            )
        )
    );
/* eslint-enable @typescript-eslint/no-explicit-any */

export function peek<T>(target: Observable<T>): T | undefined {
    let value: T | undefined;
    target.subscribe(v => value = v).unsubscribe();
    return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventCallback<T, A extends any[]>(
    callback: (event: T, ...args: A) => void,
    read: { [K in keyof A] : ObservableInput<A[K]> },
    inputs?: unknown[]
) {
    const events = new Subject<T>();

    useEffect(() => {
        const sub = events.pipe(withLatestFrom<T, A>(...read))
            .subscribe((values) => {
                callback(...values);
            });

        return () => sub.unsubscribe();
    }, inputs);

    return (event: T) => () => events.next(event);
}

const NO_VALUE = 'RxReactNoValue';

export function useObservable<T>($source: Observable<T>): T {
    const sourceRef = useRef<Observable<T> | null>(null);
    // T | 'RxReactNoValue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let initialValue: any = NO_VALUE;
    let returnInitialValue = false;

    if (sourceRef.current !== $source) {
        sourceRef.current = $source;
        returnInitialValue = true;

        $source.subscribe(value => initialValue = value).unsubscribe();

        if (initialValue === NO_VALUE) {
            throw firstValueFrom($source);
        }
    }

    const [value, setValue] = useState<T>(initialValue);

    useEffect(() => {
        const subscription = $source.subscribe(setValue);
        return () => subscription.unsubscribe();
    }, [$source]);

    return returnInitialValue ? initialValue : value;
}

export function ensureObservable<T, Q>($source: Observable<T> | undefined, fallback: Q): Observable<T | Q> {
    return $source === undefined ? of(fallback) : $source;
}
