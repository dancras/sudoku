import { decodeContents, encodeContents } from 'src/Share/ContentsEncoder';
import { SudokuGame } from 'src/Sudoku';
import { SudokuApp } from 'src/SudokuApp';

export function loadSharedGame(app: SudokuApp) {
    if (window.location.hash) {
        const contents = decodeContents(window.location.hash.substring(1));
        app.loadGame(contents);
        history.replaceState(null, '', '.');
    }
}

export function shareGame(game: SudokuGame) {
    const url = new URL(window.location.href);
    url.hash = encodeContents(game.getContents());

    if (typeof navigator.share === 'function') {
        navigator.share({
            url: url.toString()
        });
    } else {
        navigator.clipboard.writeText(url.toString());
    }
}
