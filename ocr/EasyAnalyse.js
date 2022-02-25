
export function findConnectedPixels(easyCanvas, on=255) {
    const { w } = easyCanvas;
    const predecessorOffsets = [-w - 1, -w, 1 - w, -1];
    const groups = [];
    const uniqueGroups = new Set();

    for (let pixel of easyCanvas.pixels) {

        if (pixel.r === on) {
            let group = {
                members: [pixel],
                mergeWith(other) {
                    const [big, small] = other.members.length > this.members.length ? [other, this] : [this, other];

                    for (let pixel of small.members) {
                        big.members.push(pixel);
                        groups[pixel.i] = big;
                    }

                    uniqueGroups.delete(small);

                    return big;
                }
            };
            uniqueGroups.add(group);
            groups[pixel.i] = group;

            for (let offset of predecessorOffsets) {
                const pre = groups[pixel.i + offset];

                if (pre && pre !== group) {
                    group = group.mergeWith(pre);
                }
            }
        }
    }

    return Array.from(uniqueGroups).map(group => group.members);
}

export function findCorners(pixels) {

    let topLeft = pixels[0];
    let topRight = pixels[0];
    let bottomLeft = pixels[0];
    let bottomRight = pixels[0];

    for (let pixel of pixels) {
        topLeft = (topLeft.x * topLeft.y < pixel.x * pixel.y) ? topLeft : pixel;
        topRight = (topRight.rx * topRight.y < pixel.rx * pixel.y) ? topRight : pixel;
        bottomLeft = (bottomLeft.x * bottomLeft.ry < pixel.x * pixel.ry) ? bottomLeft : pixel;
        bottomRight = (bottomRight.rx * bottomRight.ry < pixel.rx * pixel.ry) ? bottomRight : pixel;
    }

    return [topLeft, topRight, bottomRight, bottomLeft];
}

export function findExtremities(canvas, pixels) {
    let minX = 999999;
    let maxX = 0;
    let minY = 999999;
    let maxY = 0;

    for (const pixel of pixels) {
        minX = Math.min(minX, pixel.x);
        maxX = Math.max(maxX, pixel.x);
        minY = Math.min(minY, pixel.y);
        maxY = Math.max(maxY, pixel.y);
    }

    return [canvas.pixel(minX, minY), canvas.pixel(maxX, minY), canvas.pixel(maxX, maxY), canvas.pixel(minX, maxY)];
}
