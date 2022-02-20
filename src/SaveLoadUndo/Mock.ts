import { ManagedUpdate } from 'src/SaveLoadUndo/ManagedUpdate';
import { SudokuGameContents, ValidNumber } from 'src/Sudoku';

export function createCellUpdate(cellIndex: number, contents: ValidNumber | null): ManagedUpdate {
    return {
        type: 'GridUpdate',
        detail: {
            type: 'CellUpdate',
            cellIndex,
            contents,
        }
    };
}

export function createCandidateUpdate(cellIndex: number, candidate: ValidNumber, isShowing = true): ManagedUpdate {
    return {
        type: 'GridUpdate',
        detail: {
            type: 'CandidateUpdate',
            cellIndex,
            candidate,
            isShowing
        }
    };
}

export function createNewGameUpdate(): ManagedUpdate {
    return {
        type: 'AppUpdate',
        detail: {
            type: 'NewGameUpdate'
        }
    };
}

export function createLoadGameUpdate(contents: SudokuGameContents): ManagedUpdate {
    return {
        type: 'AppUpdate',
        detail: {
            type: 'LoadGameUpdate',
            contents
        }
    };
}

export function createStartGameUpdate(): ManagedUpdate {
    return {
        type: 'AppUpdate',
        detail: {
            type: 'StartGameUpdate'
        }
    };
}
