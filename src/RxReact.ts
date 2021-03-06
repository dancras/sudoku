import { Context, createContext, useEffect, useMemo, useRef, useState } from 'react';
import { asyncScheduler, firstValueFrom, Observable, ObservableInput, observeOn, of, Subject, withLatestFrom } from 'rxjs';
import { SpyInstanceFn } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Writeable<T> =
    (T extends Subject<infer C> ? Subject<Writeable<C>> :
        (T extends Observable<infer C> ? Subject<Writeable<C>> :
            (T extends [unknown?, unknown?, unknown?, unknown?, unknown?] ? { [K in keyof T]: Writeable<T[K]> } :
                (T extends Array<infer C> ? Array<Writeable<C>> :
                    (T extends (...args: infer A) => infer R ? SpyInstanceFn<A, R> :
                        (T extends { [K in keyof T]: unknown } ? { [K in keyof T]: Writeable<T[K]> } :
                            T
                        )
                    )
                )
            )
        )
    );
/* eslint-enable @typescript-eslint/no-explicit-any */

export function defineDependencies<T>(): Context<T> {
    return createContext<T>(new Proxy({}, {
        get() {
            throw new Error('Missing Context dependencies');
        }
    }) as T);
}

export function peek<T>(target: Observable<T> | T): T {
    let value: T;

    if (target instanceof Observable) {
        target.subscribe(v => value = v).unsubscribe();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return value!;
    } else {
        return target;
    }

}

export function prewarm<T>() {
    return (source$: Observable<T>) => {
        const sub = source$.pipe(observeOn(asyncScheduler)).subscribe(() => sub.unsubscribe());
        return source$;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventCallback<T, A extends any[]>(
    callback: (event: T, ...args: A) => void,
    read: { [K in keyof A] : ObservableInput<A[K]> },
    inputs?: unknown[]
) {
    const events = useMemo(() => new Subject<T>(), inputs);

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
