import EasyCanvas from 'src/GridFromImage/EasyCanvas';

export function padCanvas(
    factory: (w: number, h: number) => HTMLCanvasElement,
    original: EasyCanvas,
    w: number,
    h: number,
) {
    const wdiff = w - original.w;
    const hdiff = h - original.h;

    const paddedCanvas = new EasyCanvas(factory, w, h);
    paddedCanvas.fill('white');
    paddedCanvas.drawImage(original.canvas, Math.round(wdiff / 2), Math.round(hdiff / 2));
    return paddedCanvas;
}

export function applyGreyscale(canvas: EasyCanvas) {
    for (const pixel of canvas.pixels) {
        // Note: This greyscale balance is not great for general purpose
        const greyLevel = 0.30 * pixel.r + 0.30 * pixel.g + 0.40 * pixel.b;
        pixel.setRGB(greyLevel);
    }

    return canvas;
}

export function applyThreshold(canvas: EasyCanvas) {
    for (const pixel of canvas.pixels) {
        const onOrOff = pixel.r < 126 ? 0 : 255;
        pixel.setRGB(onOrOff);
    }

    return canvas;
}

export function applyMask(canvas: EasyCanvas, mask: number[]) {
    for (const pixel of canvas.pixels) {
        if (!mask.includes(pixel.i)) {
            pixel.setRGB(255);
        }
    }
    return canvas;
}

function easeInOutCubic(x: number) {
    return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
}

export function applyDarken(canvas: EasyCanvas) {
    let darkest = 255;

    for (const pixel of canvas.pixels) {
        darkest = Math.min(darkest, pixel.r);
    }

    const lighestDiff = 255 - darkest;

    for (const pixel of canvas.pixels) {
        const diff = pixel.r - darkest;
        const darkness = easeInOutCubic(1 - (diff / lighestDiff));
        pixel.setRGB(pixel.r - Math.round(darkest * darkness));
    }
    return canvas;
}

export function erode(canvas: EasyCanvas) {
    const result: Record<number, number[]> = {};

    function appendResult(i: number, greyLevel: number) {
        result[i] = result[i] || [];
        result[i].push(greyLevel);
    }

    for (const pixel of canvas.pixels) {
        if (pixel.r < 255) {
            const up = canvas.pixels[pixel.i - canvas.w];
            const down = canvas.pixels[pixel.i + canvas.w];
            const left = canvas.pixels[pixel.i - 1];
            const right = canvas.pixels[pixel.i + 1];

            up && appendResult(up.i, pixel.r);
            down && appendResult(down.i, pixel.r);
            left && appendResult(left.i, pixel.r);
            right && appendResult(right.i, pixel.r);
        }
    }

    for (const i in result) {
        const greyLevel = Math.min(...result[i]);
        canvas.pixels[i].setRGB(greyLevel);
    }

    return canvas;
}
