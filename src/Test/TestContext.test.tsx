import { act, render } from '@testing-library/preact';
import { createContext } from 'preact';
import { createTestConsumer, createTestProvider } from 'src/Test/TestContext';

const ExampleContext = createContext('foo');

test('TestProvider comes with setContextValue function', async () => {
    const [TestProvider, setContextValue] = createTestProvider(ExampleContext, 'foo');
    const [TestConsumer, readContextValue] = createTestConsumer(ExampleContext);

    render(
        <TestProvider>
            <TestConsumer />
        </TestProvider>
    );

    expect(readContextValue()).toEqual('foo');

    await act(() => {
        setContextValue('bar');
    });

    expect(readContextValue()).toEqual('bar');
});
