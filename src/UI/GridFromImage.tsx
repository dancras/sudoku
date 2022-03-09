import { Subject } from 'rxjs';
import { extractGridFromImage } from 'src/GridFromImage';
import { SudokuApp } from 'src/SudokuApp';
import { MessageData } from 'src/UI/Messages';

export function setupGridFromImage(app: SudokuApp, messages$: Subject<MessageData>, dismiss$: Subject<void>) {
    return function gridFromImage(image: HTMLCanvasElement) {
        return extractGridFromImage(image, (progress) => {
            return new Promise<void>((resolve) => {
                messages$.next({
                    body: <p>{ progress.step }</p>,
                    onRender: resolve
                });
            });
        }).then((contents) => {
            dismiss$.next();
            app.loadGame(contents, false);
        });
    };
}
