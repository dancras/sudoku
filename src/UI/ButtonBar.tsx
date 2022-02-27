import { useContext } from 'react';
import { IoArrowRedoOutline, IoArrowUndoOutline, IoCameraOutline, IoPlayOutline, IoRefresh, IoShareOutline, IoTrashOutline } from 'react-icons/io5';
import { defineDependencies, useObservable } from 'src/RxReact';
import { SaveLoadUndo } from 'src/SaveLoadUndo';
import { SudokuGame } from 'src/Sudoku';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import 'src/UI/ButtonBar.css';

export const ButtonBarContext = defineDependencies<{
    app: SudokuApp,
    share: (game: SudokuGame) => void,
    saveLoadUndo: SaveLoadUndo,
    gridFromImage: (image: HTMLCanvasElement) => Promise<void>
}>();

export default function ButtonBar() {
    const { app, share, saveLoadUndo, gridFromImage } = useContext(ButtonBarContext);
    const status = useObservable(app.status$);
    const canStart = useObservable(app.canStart$);
    const canReset = useObservable(app.canReset$);
    const game = useObservable(app.game$);

    const showStartButton = status === SudokuGameStatus.Creating;
    const showNewGameButton = status !== SudokuGameStatus.Creating && !canReset;
    const showResetGameButton = status !== SudokuGameStatus.Creating && canReset;
    const showShareButton = status !== SudokuGameStatus.Creating;

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files ? event.target.files[0] : null;

        if (file) {
            const img = new Image();
            img.onload = function () {
                const resize = document.createElement('canvas');
                const resizeFactor = 600 / img.width;
                resize.width = 600;
                resize.height = img.height * resizeFactor;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const ctx = resize.getContext('2d')!;
                ctx.drawImage(img, 0, 0, resize.width, resize.height);
                gridFromImage(resize).then(() => {
                    URL.revokeObjectURL(img.src);
                });
            };
            img.src = URL.createObjectURL(file);
        }
    }

    return (
        <div className="ButtonBar">
            <button onClick={() => saveLoadUndo.undo()}><IoArrowUndoOutline /></button>
            { showStartButton && <button disabled={ !canStart } onClick={() =>  app.startGame()} data-testid="button-bar-start"><IoPlayOutline /></button> }
            { showNewGameButton && <button onClick={() => app.newGame()} data-testid="button-bar-new"><IoTrashOutline /></button> }
            { showResetGameButton && <button onClick={() => app.resetGame()} data-testid="button-bar-reset"><IoRefresh /></button> }
            { !showShareButton &&
                <>
                    <input hidden type="file" accept="image/*" onChange={handleImageUpload} />
                    <button onClick={(event) => (event.currentTarget.previousSibling as any).click()}><IoCameraOutline /></button>
                </>
            }
            { showShareButton && <button onClick={() => share(game)} data-testid="button-bar-share"><IoShareOutline /></button> }
            <button onClick={() => saveLoadUndo.redo()}><IoArrowRedoOutline /></button>
        </div>
    );
}
