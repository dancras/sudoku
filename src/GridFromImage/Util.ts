export function createCanvas(w = 0, h = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
}

export function range(start: number, end: number): number[] {
    return Array.from({ length: end - start }).map((x, i) => start + i);
}

export function findLargest<T>(array2D: T[][]): T[] {
    let largest: T[] = [];
    for (const array of array2D) {
        if (array.length > largest.length) {
            largest = array;
        }
    }
    return largest;
}
