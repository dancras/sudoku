import { useContext, useMemo } from 'react';
import { combineLatest, map, Observable } from 'rxjs';
import { defineDependencies, useEventCallback, useObservable } from 'src/RxReact';
import { MapValidsNumberTo, SudokuCell, ValidNumber, VALID_NUMBERS } from 'src/Sudoku';
import { SudokuApp, SudokuGameStatus } from 'src/SudokuApp';
import 'src/UI/SudokuGrid.css';

export const SudokuGridContext = defineDependencies<{
    selectedNumber$: Observable<ValidNumber>
    app: SudokuApp
}>();

enum CellEvents {
    Click,
    DblClick
}

type Highlights = {
    highlightCell$: Observable<boolean>,
    highlightCandidate: MapValidsNumberTo<Observable<boolean>>
}

export default function SudokuGrid() {
    const { selectedNumber$, app } = useContext(SudokuGridContext);
    const game = useObservable(app.game$);

    const highlights: Highlights[] = useMemo(() => game.cells.map(cell => ({
        highlightCell$: combineLatest([cell.contents$, selectedNumber$]).pipe(
            map(([contents, selectedNumber]) => !!contents && contents[0] === selectedNumber)
        ),
        highlightCandidate: VALID_NUMBERS.reduce((acc, n) => Object.assign(acc, {
            [n]: combineLatest([cell.candidates[n], selectedNumber$]).pipe(
                map(([candidateStatus, selectedNumber]) => candidateStatus !== null && n === selectedNumber)
            )
        }), {} as MapValidsNumberTo<Observable<boolean>>)
    })), [game.cells]);

    return (
        <div className="SudokuGrid" data-testid="sudoku-grid">
            {game.cells.map((cell, i) =>
                <Cell key={i} cell={cell} selectedNumber$={selectedNumber$} app={app} highlights={highlights[i]} />
            )}
        </div>
    );
}

function Cell({ cell, selectedNumber$, app, highlights }: { cell: SudokuCell, selectedNumber$: Observable<ValidNumber>, app: SudokuApp, highlights: Highlights }) {

    const [contents, isValid] = useObservable(cell.contents$) || [null, true];
    const isHighlighted = useObservable(highlights.highlightCell$);

    const notifies = useEventCallback((cellEvent: CellEvents, selectedNumber: ValidNumber, status) => {
        if (cell.isLocked) {
            return;
        } else if (
            status === SudokuGameStatus.Creating && cellEvent === CellEvents.Click ||
            status === SudokuGameStatus.Solving && cellEvent === CellEvents.DblClick
        ) {
            cell.toggleContents(selectedNumber);
        } else if (status === SudokuGameStatus.Solving && cellEvent === CellEvents.Click) {
            cell.toggleCandidate(selectedNumber);
        }
    }, [selectedNumber$, app.status$], [cell, cell.isLocked]);

    return (
        <div className={`--Cell ${cell.isLocked ? '-Locked' : ''} ${isHighlighted ? '-Highlight' : ''} ${contents ? `-ShowingContents ${isValid ? '-Valid' : '-Invalid'}` : '-ShowingCandidates'}`}
             onClick={notifies(CellEvents.Click)}
             onDoubleClick={notifies(CellEvents.DblClick)}
        >
            <div className="--Candidates">
                {VALID_NUMBERS.map(n =>
                    <CellCandidate key={n} candidate={n} status$={cell.candidates[n]} isHighlighted$={highlights.highlightCandidate[n]} />
                )}
            </div>
            <div className="--Contents">
                { contents }
            </div>
        </div>
    );
}

function CellCandidate({ candidate, status$, isHighlighted$ }: { candidate: number, status$: Observable<boolean | null>, isHighlighted$: Observable<boolean> }) {
    const status = useObservable(status$);
    const isHighlighted = useObservable(isHighlighted$);
    return (
        <div className={`--Candidate ${isHighlighted ? '-Highlight' : ''} ${ status !== null ? (status ? '-Valid' : '-Invalid') : '' }`}>{ status !== null ? candidate : ' ' }</div>
    );
}
