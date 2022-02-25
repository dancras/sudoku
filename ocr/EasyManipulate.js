import EasyCanvas from '#ocr/EasyCanvas.js';

export function padCanvas(factory, c, w, h) {
    const wdiff = w - c.w;
    const hdiff = h - c.h;

    const paddedCanvas = new EasyCanvas(factory, w, h);
    paddedCanvas.fill('white');
    paddedCanvas.drawImage(c.canvas, Math.round(wdiff / 2), Math.round(hdiff / 2));
    return paddedCanvas;
}

export function applyGreyscale(canvas) {
    for (let pixel of canvas.pixels) {
        // Note: This greyscale balance is not great for general purpose
        const greyLevel = 0.30 * pixel.r + 0.30 * pixel.g + 0.40 * pixel.b;
        pixel.rgb = greyLevel;
    }

    return canvas;
}

export function applyThreshold(canvas) {
    for (let pixel of canvas.pixels) {
        const onOrOff = pixel.r < 126 ? 0 : 255;
        pixel.rgb = onOrOff;
    }

    return canvas;
}

export function applyMask(canvas, mask) {
    for (let pixel of canvas.pixels) {
        if (!mask.includes(pixel.i)) {
            pixel.rgb = 255;
        }
    }
    return canvas;
}

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
}

export function applyDarken(canvas) {
    let darkest = 255;

    for (let pixel of canvas.pixels) {
        darkest = Math.min(darkest, pixel.r);
    }

    const lighestDiff = 255 - darkest;

    for (let pixel of canvas.pixels) {
        const diff = pixel.r - darkest;
        const darkness = easeInOutCubic(1 - (diff / lighestDiff));
        pixel.rgb = pixel.r - Math.round(darkest * darkness);
    }
    return canvas;
}

export function erode(canvas) {
    const result = {};

    function appendResult(i, greyLevel) {
        result[i] = result[i] || [];
        result[i].push(greyLevel);
    }

    for (let pixel of canvas.pixels) {
        if (pixel.r < 255) {
            const up = canvas.pixel(pixel.i - canvas.w);
            const down = canvas.pixel(pixel.i + canvas.w);
            const left = canvas.pixel(pixel.i - 1);
            const right = canvas.pixel(pixel.i + 1);

            up && appendResult(up.i, pixel.r);
            down && appendResult(down.i, pixel.r);
            left && appendResult(left.i, pixel.r);
            right && appendResult(right.i, pixel.r);
        }
    }

    for (let i in result) {
        const greyLevel = Math.min(...result[i]);
        canvas.pixel(i).rgb = greyLevel;
    }

    return canvas;
}
