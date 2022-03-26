import { ManagedUpdate } from 'src/SaveLoadUndo/ManagedUpdate';
import { CandidateColor, SudokuGameContents, ValidNumber } from 'src/Sudoku';

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

export function createCandidateUpdate(cellIndex: number, candidate: ValidNumber, color: CandidateColor | null): ManagedUpdate {
    return {
        type: 'GridUpdate',
        detail: {
            type: 'CandidateUpdate',
            cellIndex,
            candidate,
            color
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

export function createLoadGameUpdate(contents: SudokuGameContents, startGame: boolean): ManagedUpdate {
    return {
        type: 'AppUpdate',
        detail: {
            type: 'LoadGameUpdate',
            contents,
            startGame
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

export function createResetGameUpdate(): ManagedUpdate {
    return {
        type: 'AppUpdate',
        detail: {
            type: 'ResetGameUpdate'
        }
    };
}
