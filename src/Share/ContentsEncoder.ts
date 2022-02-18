import { SudokuGameContents, ValidNumber } from 'src/Sudoku';

// https://coolaj86.com/articles/bigints-and-base64-in-javascript/
function bnToB64(bn: string) {
    let hex = BigInt(bn).toString(16);
    if (hex.length % 2) { hex = '0' + hex; }

    const bin = [];
    let i = 0;
    let d;
    let b;
    while (i < hex.length) {
        d = parseInt(hex.slice(i, i + 2), 16);
        b = String.fromCharCode(d);
        bin.push(b);
        i += 2;
    }

    return btoa(bin.join(''));
}

function b64ToBn(b64: string) {
    const bin = atob(b64);
    const hex: string[] = [];

    bin.split('').forEach(function (ch) {
        let h = ch.charCodeAt(0).toString(16);
        if (h.length % 2) { h = '0' + h; }
        hex.push(h);
    });

    return BigInt('0x' + hex.join(''));
}

function base64ToUrlBase64(str: string) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function urlBase64ToBase64(str: string) {
    const r = str.length % 4;
    if (2 === r) {
        str += '==';
    } else if (3 === r) {
        str += '=';
    }
    return str.replace(/-/g, '+').replace(/_/g, '/');
}

const conversions = [
    ['000000000', '_9'],
    ['00000000', '_8'],
    ['0000000', '_7'],
    ['000000', '_6'],
    ['00000', '_5'],
    ['0000', '_4'],
    ['000', '_3'],
    ['00', '_2'],
    ['0', '_1'],
    ['_', '0']
];

const reverseConversions = [...conversions].reverse();

export function encodeContents(contents: SudokuGameContents) {
    const gridAsString = contents.map(x => x === null ? 0 : x).join('');
    const trimPreceedingZeros = BigInt(gridAsString).toString();
    const convertZeroGroups = conversions.reduce((acc, [from, to]) => {
        return acc.replaceAll(from, to);
    }, trimPreceedingZeros);

    return base64ToUrlBase64(bnToB64(convertZeroGroups));
}

export function decodeContents(encoded: string): SudokuGameContents {
    const gridWithConvertedZeros = b64ToBn(urlBase64ToBase64(encoded)).toString();
    const gridMissingPreceedingZeros = reverseConversions.reduce((acc, [to, from]) => {
        return acc.replaceAll(from, to);
    }, gridWithConvertedZeros);
    const gridAsString = gridMissingPreceedingZeros.padStart(81, '0');

    return gridAsString.split('').map(
        x => x === '0' ? null : parseInt(x, 10) as ValidNumber
    );
}
