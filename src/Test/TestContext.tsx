import { act } from '@testing-library/react';
import { Context, PropsWithChildren, useContext, useState } from 'react';
import { tuple } from 'src/Foundations';

export type ContextValue<T> = T extends Context<infer V> ? V : never;
export type SetContext<T> = (value: ContextValue<T>) => void;

export function createTestProvider<T>(Context: Context<T>, defaultValue?: T) {
    let setContextValueReference: (value: T) => void;

    async function setContextValue(value: T) {
        act(() => {
            setContextValueReference(value);
        });
    }

    function TestProvider({ children }: PropsWithChildren<unknown>) {
        const [value, setValue] = useState<T | undefined>(defaultValue);
        setContextValueReference = setValue;
        return !value ? <></> : (
            <Context.Provider value={ value }>
                { children }
            </Context.Provider>
        );
    }

    return tuple(TestProvider, setContextValue);
}

export function createTestConsumer<T>(Context: Context<T>) {
    let contextValue: T;

    function readContext(): T {
        return contextValue;
    }

    function TestConsumer() {
        const value = useContext(Context);
        contextValue = value;
        return <></>;
    }

    return tuple(TestConsumer, readContext);
}
