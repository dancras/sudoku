import { render, screen } from '@testing-library/react';
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
        text: ['Abc', 'Def']
    });

    expect(screen.getByText('Abc')).toBeInTheDocument();
    expect(screen.getByText('Def')).toBeInTheDocument();
});

test('-ShowingMessage class is present only when a message is showing', () => {
    expect(screen.getByTestId('messages').className).not.toContain('-ShowingMessage');

    message$.next({
        text: ['Abc']
    });

    expect(screen.getByTestId('messages').className).toContain('-ShowingMessage');
});

test('dismiss is notified when messages container receives a click', () => {
    const dismissSpy = vi.fn();
    dismiss$.subscribe(dismissSpy);

    userEvent.click(screen.getByTestId('messages'));

    expect(dismissSpy).toHaveBeenCalled();
});

describe('createMessagesModel()', () => {

    test('it emits latest message$ from messages$ stream', () => {
        const { message$, messages$ } = createMessagesModel();

        messages$.next({
            text: ['foo']
        });

        expect(peek(message$)).toEqual({
            text: ['foo']
        });

        messages$.next({
            text: ['bar']
        });

        expect(peek(message$)).toEqual({
            text: ['bar']
        });
    });

    test('it clears latest message$ when dismiss$ receives', () => {
        const { message$, messages$, dismiss$ } = createMessagesModel();

        expect(peek(message$)).toEqual(undefined);

        messages$.next({
            text: ['foo']
        });

        dismiss$.next();

        expect(peek(message$)).toEqual(undefined);
    });

    test('it queues messages until dismiss when mustDismiss is true', () => {
        const { message$, messages$, dismiss$ } = createMessagesModel();

        messages$.next({
            text: ['foo'],
            mustDismiss: true
        });

        // Will be skipped
        messages$.next({
            text: ['bar'],
        });

        messages$.next({
            text: ['abc'],
            mustDismiss: true,
        });

        messages$.next({
            text: ['def'],
        });

        expect(peek(message$)).toEqual({
            text: ['foo'],
            mustDismiss: true
        });

        dismiss$.next();

        expect(peek(message$)).toEqual({
            text: ['abc'],
            mustDismiss: true,
        });

        dismiss$.next();

        expect(peek(message$)).toEqual({
            text: ['def']
        });

        dismiss$.next();

        expect(peek(message$)).toEqual(undefined);
    });

});
