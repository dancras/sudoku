import { decodeContents, encodeContents } from 'src/Share/ContentsEncoder';
import { SudokuGameContents } from 'src/Sudoku';

describe('ContentsEncoder', () => {

    it('encodes a contents array to a smaller representation', () => {

        const contents: SudokuGameContents = Array.from({ length: 81 }).map(() => null);
        contents[4] = 7;
        contents[15] = 9;
        contents[20] = 6;
        contents[80] = 1;

        const encodedContents = encodeContents(contents);
        const decodedContents = decodeContents(encodedContents);

        expect(encodedContents.length).toBeLessThan(60);
        console.log(encodedContents);
        expect(decodedContents).toEqual(contents);

    });

});
