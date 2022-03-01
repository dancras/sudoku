import { useContext } from 'react';
import { concat, concatAll, first, map, merge, NEVER, Observable, of, shareReplay, startWith, Subject, takeUntil } from 'rxjs';
import { defineDependencies, prewarm, useObservable } from 'src/RxReact';
import 'src/UI/Messages.css';

export type MessageArrow = {
    target: 'ButtonBar',
    button: number,
    otherButton?: number
} | {
    target: 'NumberPicker'
} | {
    target: 'SudokuGrid'
};

export type MessageData = {
    text: string[],
    mustDismiss?: boolean,
    arrow?: MessageArrow
}

export const MessagesContext = defineDependencies<{
    message$: Observable<MessageData | undefined>,
    dismiss$: Subject<void>
}>();

interface MessageStyle extends React.CSSProperties {
    '--arrow-button'?: number;
    '--arrow-other-button'?: number;
}

export default function Messages() {
    const { message$, dismiss$ } = useContext(MessagesContext);
    const message = useObservable(message$);

    const arrowStyle = message && message.arrow && message.arrow.target === 'ButtonBar' ?
        {
            '--arrow-button': message.arrow.button,
            '--arrow-other-button': message.arrow.otherButton,
        } as MessageStyle :
        undefined;

    return (
        <div className={`Messages ${ message ? '-ShowingMessage' : '' }`} onClick={() => dismiss$.next()} data-testid="messages">
            { message &&
                <div className={`--Message ${message.arrow ? '-Indicating' : ''}`}
                     data-arrow-target={ message.arrow && message.arrow.target }
                     style={ arrowStyle }
                     data-arrow-other-button={ message?.arrow?.target === 'ButtonBar' ? message?.arrow?.otherButton : undefined }
                     data-testid="messages-message"
                >
                    { message.text.map(text => <p key={text}>{ text }</p>) }
                </div>
            }
        </div>
    );
}

export function createMessagesModel() {
    const messages$ = new Subject<MessageData>();
    const dismiss$ = new Subject<void>();

    const message$ = messages$.pipe(
        map(data => takeAUntilBThenC({
            a: data,
            b$: data.mustDismiss ? dismiss$ : merge(dismiss$, hot(messages$)),
            c: undefined
        })),
        concatAll(),
        startWith(undefined),
        shareReplay(1),
        prewarm()
    );

    return {
        messages$,
        message$,
        dismiss$
    };
}

function hot<T>(source$: Observable<T>) {
    return source$.pipe(
        // Short lived observables with shareReplay must terminate to avoid memory leaks
        first(),
        shareReplay(1),
        prewarm()
    );
}

function takeAUntilBThenC<T>(
    { a, b$, c } : { a: T, b$: Observable<unknown>, c: T }
) {
    return concat(NEVER.pipe(startWith(a), takeUntil(b$)), of(c));
}
