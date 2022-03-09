import { Subject } from 'rxjs';
import { shareGame, ShareMethod } from 'src/Share/FragmentShare';
import { SudokuGame } from 'src/Sudoku';
import { MessageData } from 'src/UI/Messages';

export function setupShare(messages$: Subject<MessageData>) {
    return function shareGameWithFeedback(game: SudokuGame) {
        if (shareGame(game) === ShareMethod.Clipboard) {
            messages$.next({
                body: <p>Copied Link To Clipboard.</p>
            });
        }
    };
}
