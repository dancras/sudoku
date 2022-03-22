import { decodeContents, encodeContents } from 'src/Share/ContentsEncoder';
import { SudokuGame } from 'src/Sudoku';
import { SudokuApp } from 'src/SudokuApp';

export enum ShareMethod {
    Mobile,
    Clipboard
}

export function loadSharedGame(app: SudokuApp) {
    if (window.location.hash) {
        const contents = decodeContents(window.location.hash.substring(1));
        app.loadGame(contents, true);
        history.replaceState(null, '', '.');
    }
}

export function shareGame(game: SudokuGame): ShareMethod {
    const url = new URL(window.location.href);
    url.hash = encodeContents(game.getContents(true));

    if (typeof navigator.share === 'function') {
        navigator.share({
            url: url.toString()
        });
        return ShareMethod.Mobile;
    } else {
        navigator.clipboard.writeText(url.toString());
        return ShareMethod.Clipboard;
    }
}
