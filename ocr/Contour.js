function convertImageDataToBinaryPixels(imageData, on) {
    const pixels = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
        pixels.push(imageData.data[i] === on ? 1 : 0);
    }

    return pixels;
}

export function findConnectedPixelGroups(imageData, on=255) {
    const w = imageData.width;
    const pixels = convertImageDataToBinaryPixels(imageData, on);
    const predecessorOffsets = [-w - 1, -w, 1 - w, -1];
    const groups = [];
    const uniqueGroups = new Set();

    for (let i = 0; i < pixels.length; i++) {
        const pixel = pixels[i];

        if (pixel === 1) {
            let group = {
                members: [i],
                mergeWith(other) {
                    const [big, small] = other.members.length > this.members.length ? [other, this] : [this, other];

                    for (let i of small.members) {
                        big.members.push(i);
                        groups[i] = big;
                    }

                    uniqueGroups.delete(small);

                    return big;
                }
            };
            uniqueGroups.add(group);
            groups[i] = group;

            for (let j of predecessorOffsets) {
                const pre = groups[i + j];

                if (pre && pre !== group) {
                    group = group.mergeWith(pre);
                }
            }
        }
    }

    return Array.from(uniqueGroups).map(group => group.members);
}

// Slow, working
// export function findConnectedPixelGroups(imageData, on=255, rangeFn=undefined) {
//     const [w, h] = [imageData.width, imageData.height];
//     const [start, end] = rangeFn ? rangeFn(w, h) : [0, w * h];
//     const pixels = convertImageDataToBinaryPixels(imageData, on);
//     const neighbours = [-w - 1, -w, 1 - w, -1, 1, w - 1,  w,  w + 1];
//     const connectedGroups = [];
//     const visitedPixels = {};

//     const searchQueue = [];
//     for (let i = start; i < end; i++) {
//         searchQueue.unshift([i, null]);
//     }

//     let nextSearch;
//     while ((nextSearch = searchQueue.pop())) {
//         let [i, group] = nextSearch;
//         const pixel = pixels[i];

//         if (visitedPixels[i] === true) {
//             continue;
//         }

//         visitedPixels[i] = true;

//         if (pixel === undefined) {
//             continue;
//         }

//         if (pixel === 1) {
//             if (group === null) {
//                 group = [i];
//                 connectedGroups.push(group);
//             } else {
//                 group.push(i);
//             }

//             for (let neighbour of neighbours) {
//                 searchQueue.push([i + neighbour, group]);
//             }
//         }
//     }

//     return connectedGroups;
// }

export function keepLargestGroup(groups) {
    let largest = [];
    for (let group of groups) {
        if (group.length > largest.length) {
            largest = group;
        }
    }
    return largest;
}

function indexToCoordinate(i, w) {
    const x = Math.floor(i % w);
    const y = Math.floor(i / w);
    return [x, y];
}

function coordinateToIndex(x, y, w) {
    return y * w + x;
}

function mostTopLeft(i, j, w) {
    const [ix, iy] = indexToCoordinate(i, w);
    const [jx, jy] = indexToCoordinate(j, w);
    return (ix * iy < jx * jy) ? i : j;
}

function mostTopRight(i, j, w) {
    const [ix, iy] = indexToCoordinate(i, w);
    const [jx, jy] = indexToCoordinate(j, w);
    return ((w - ix) * iy < (w - jx) * jy) ? i : j;
}

function mostBottomLeft(i, j, w, h) {
    const [ix, iy] = indexToCoordinate(i, w);
    const [jx, jy] = indexToCoordinate(j, w);
    return (ix * (h - iy) < jx * (h - jy)) ? i : j;
}

function mostBottomRight(i, j, w, h) {
    const [ix, iy] = indexToCoordinate(i, w);
    const [jx, jy] = indexToCoordinate(j, w);
    return ((w - ix) * (h - iy) < (w - jx) * (h - jy)) ? i : j;
}

export function findCorners(w, h, group) {

    let topLeft = h * w + (w - 1);
    let topRight = h * w;
    let bottomLeft = w - 1;
    let bottomRight = 0;

    for (let i of group) {
        topLeft = mostTopLeft(topLeft, i, w);
        topRight = mostTopRight(topRight, i, w);
        bottomLeft = mostBottomLeft(bottomLeft, i, w, h);
        bottomRight = mostBottomRight(bottomRight, i, w, h);
    }

    return [topLeft, topRight, bottomLeft, bottomRight];
}

export function findExtremities(group, w) {
    let minX = 9999;
    let maxX = 0;
    let minY = 9999;
    let maxY = 0;

    for (let i of group) {
        const [x, y] = indexToCoordinate(i, w);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    return [coordinateToIndex(minX, minY, w), coordinateToIndex(maxX, maxY, w)];
}
