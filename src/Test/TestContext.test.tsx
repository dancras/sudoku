import { render } from '@testing-library/react';
import { createContext } from 'react';
import { createTestConsumer, createTestProvider } from 'src/Test/TestContext';

const ExampleContext = createContext('foo');

test('TestProvider comes with setContextValue function', () => {
    const [TestProvider, setContextValue] = createTestProvider(ExampleContext, 'foo');
    const [TestConsumer, readContextValue] = createTestConsumer(ExampleContext);

    render(
        <TestProvider>
            <TestConsumer />
        </TestProvider>
    );

    expect(readContextValue()).toEqual('foo');

    setContextValue('bar');

    expect(readContextValue()).toEqual('bar');
});
