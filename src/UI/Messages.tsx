import { useContext } from 'react';
import { concat, concatAll, first, map, merge, NEVER, Observable, of, shareReplay, startWith, Subject, takeUntil } from 'rxjs';
import { defineDependencies, prewarm, useObservable } from 'src/RxReact';
import 'src/UI/Messages.css';

export type MessageData = {
    text: string[],
    mustDismiss?: boolean
}

export const MessagesContext = defineDependencies<{
    message$: Observable<MessageData | undefined>
}>();

export default function Messages() {
    const { message$ } = useContext(MessagesContext);
    const message = useObservable(message$);

    return (
        <div className="Messages">
            { message &&
                <div className="--Message" data-testid="messages-message">
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
        map(data => takeAUntilBThenC(
            data,
            data.mustDismiss ? dismiss$ : merge(dismiss$, hot(messages$)),
            undefined
        )),
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

function takeAUntilBThenC<T>(a: T, b: Observable<unknown>, c: T) {
    return concat(NEVER.pipe(startWith(a), takeUntil(b)), of(c));
}
