import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Observable, of } from 'rxjs';
import { useEventCallback, useObservable } from 'src/RxPreact';
import 'src/UI/SudokuGrid.css';

export type Answer = [number, boolean];

export type SudokuCell = {
    contents$: Observable<Answer | null>,
    candidates: Record<number, Observable<boolean | null>>,
    isLocked$: Observable<boolean>,
    toggleContents: (contents: number) => void,
    toggleCandidate: (contents: number) => void
}

export enum SudokuGameStatus {
    Creating,
    Solving,
    Solved
}

export type SudokuGame = {
    status$: Observable<SudokuGameStatus>
}

export const SudokuGridContext = createContext({
    selectedNumber$: of(1),
    sudokuGrid: [] as SudokuCell[],
    game: { status$: of(0) } as SudokuGame
});

enum CellEvents {
    Click,
    DblClick
}

export default function SudokuGrid() {
    const { selectedNumber$, sudokuGrid, game } = useContext(SudokuGridContext);

    return (
        <div className="SudokuGrid" data-testid="sudoku-grid">
            {sudokuGrid.map((cell, i) =>
                <Cell key={i} cell={cell} selectedNumber$={selectedNumber$} game={game} />
            )}
        </div>
    );
}

function Cell({ cell, selectedNumber$, game }: { cell: SudokuCell, selectedNumber$: Observable<number>, game: SudokuGame }) {

    const isLocked = useObservable(cell.isLocked$);
    const [contents, isValid] = useObservable(cell.contents$) || [null, true];

    const notifies = useEventCallback((cellEvent: CellEvents, selectedNumber, status) => {
        if (isLocked) {
            return;
        } else if (
            status === SudokuGameStatus.Creating && cellEvent === CellEvents.Click ||
            status === SudokuGameStatus.Solving && cellEvent === CellEvents.DblClick
        ) {
            cell.toggleContents(selectedNumber);
        } else if (status === SudokuGameStatus.Solving && cellEvent === CellEvents.Click) {
            cell.toggleCandidate(selectedNumber);
        }
    }, [selectedNumber$, game.status$], [isLocked]);

    return (
        <div className={`--Cell ${isLocked ? '-Locked' : ''} ${contents ? `-ShowingContents ${isValid ? '-Valid' : '-Invalid'}` : '-ShowingCandidates'}`}
             onClick={notifies(CellEvents.Click)}
             onDblClick={notifies(CellEvents.DblClick)}
        >
            <div className="--Candidates">
                {Object.entries(cell.candidates).map(([candidate, status$]) =>
                    <CellCandidate key={candidate} candidate={parseInt(candidate)} status$={status$} />
                )}
            </div>
            <div className="--Contents">
                { contents }
            </div>
        </div>
    );
}

function CellCandidate({ candidate, status$ }: { candidate: number, status$: Observable<boolean | null> }) {
    const status = useObservable(status$);
    return (
        <div className={`--Candidate ${ status !== null ? (status ? '-Valid' : '-Invalid') : '' }`}>{ status !== null ? candidate : ' ' }</div>
    );
}
