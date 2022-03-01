import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { peek } from 'src/RxReact';
import { createTestProvider } from 'src/Test/TestContext';
import Messages, { createMessagesModel, MessageData, MessagesContext } from 'src/UI/Messages';

let TestProvider: FunctionComponent;
let message$: BehaviorSubject<MessageData | undefined>;
let dismiss$: Subject<void>;

beforeEach(() => {
    message$ = new BehaviorSubject<MessageData | undefined>(undefined);
    dismiss$ = new Subject<void>();

    [TestProvider] = createTestProvider(MessagesContext, {
        message$,
        dismiss$,
    });

    render(
        <TestProvider>
            <Messages />
        </TestProvider>
    );
});


test('it shows nothing by default', () => {
    expect(screen.queryByTestId('messages-message')).not.toBeInTheDocument();
});

test('it shows the contents of message$', () => {
    message$.next({
        body: <>
            <p>Abc</p>
            <p>Def</p>
        </>
    });

    expect(screen.getByText('Abc')).toBeInTheDocument();
    expect(screen.getByText('Def')).toBeInTheDocument();
});

test('-ShowingMessage class is present only when a message is showing', () => {
    expect(screen.getByTestId('messages').className).not.toContain('-ShowingMessage');

    message$.next({
        body: <p>Abc</p>
    });

    expect(screen.getByTestId('messages').className).toContain('-ShowingMessage');
});

test('dismiss is notified when messages container receives a click', () => {
    const dismissSpy = vi.fn();
    dismiss$.subscribe(dismissSpy);

    userEvent.click(screen.getByTestId('messages'));

    expect(dismissSpy).toHaveBeenCalled();
});

test('optional onRender is called', () => {
    const onBeforeRenderSpy = vi.fn();

    act(() => {
        message$.next({
            body: <p>foo</p>,
            onRender: onBeforeRenderSpy
        });
    });

    expect(onBeforeRenderSpy).toHaveBeenCalled();
});

describe('createMessagesModel()', () => {

    test('it emits latest message$ from messages$ stream', () => {
        const { message$, messages$ } = createMessagesModel();

        messages$.next({
            body: <p>foo</p>
        });

        expect(peek(message$)).toEqual({
            body: <p>foo</p>
        });

        messages$.next({
            body: <p>bar</p>
        });

        expect(peek(message$)).toEqual({
            body: <p>bar</p>
        });
    });

    test('it clears latest message$ when dismiss$ receives', () => {
        const { message$, messages$, dismiss$ } = createMessagesModel();

        expect(peek(message$)).toEqual(undefined);

        messages$.next({
            body: <p>foo</p>
        });

        dismiss$.next();

        expect(peek(message$)).toEqual(undefined);
    });

    test('it queues messages until dismiss when mustDismiss is true', () => {
        const { message$, messages$, dismiss$ } = createMessagesModel();

        messages$.next({
            body: <p>foo</p>,
            mustDismiss: true
        });

        // Will be skipped
        messages$.next({
            body: <p>bar</p>
        });

        messages$.next({
            body: <p>abc</p>,
            mustDismiss: true,
        });

        messages$.next({
            body: <p>def</p>
        });

        expect(peek(message$)).toEqual({
            body: <p>foo</p>,
            mustDismiss: true
        });

        dismiss$.next();

        expect(peek(message$)).toEqual({
            body: <p>abc</p>,
            mustDismiss: true,
        });

        dismiss$.next();

        expect(peek(message$)).toEqual({
            body: <p>def</p>
        });

        dismiss$.next();

        expect(peek(message$)).toEqual(undefined);
    });

});
