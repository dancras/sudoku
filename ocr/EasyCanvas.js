const _data = Symbol();

function range(start, end) {
    return Array.from({ length: end - start }).map((x, i) => start + i);
}

export default class EasyCanvas {
    #factory;
    #canvas;
    #ctx;
    #imgDataCache;
    #pixels;
    w;
    h;

    constructor(factory, w, h) {
        this.#factory = factory;
        this.#canvas = factory(w, h);
        this.#ctx = this.#canvas.getContext('2d');

        this.w = w;
        this.h = h;

        this.#pixels = range(0, this.w * this.h).map(i => new EasyPixel(this, i));
    }

    get canvas() {
        this.#ctx.putImageData(this.#imgData, 0, 0);
        return this.#canvas;
    }

    drawImage(image, x = 0, y = 0) {
        this.#ctx.drawImage(image, x, y);
    }

    get pixels() {
        return this.#pixels;
    }

    pixel(ix, y) {
        if (typeof y === 'undefined') {
            return this.#pixels[ix];
        }

        return this.#pixels[y * this.w + ix];
    }

    get #imgData() {
        if (!this.#imgDataCache) {
            this.#imgDataCache = this.#ctx.getImageData(0, 0, this.w, this.h);
        }
        return this.#imgDataCache;
    }

    get [_data]() {
        return this.#imgData.data;
    }

    clone() {
        const cloned = new EasyCanvas(this.#factory, this.w, this.h);
        cloned.drawImage(this.canvas);
        return cloned;
    }

    crop(topLeft, bottomRight) {
        const { x, y } = topLeft;
        const w = bottomRight.x - x + 1;
        const h = bottomRight.y - y + 1;

        const cropped = new EasyCanvas(this.#factory, w, h);
        cropped.drawImage(this.#canvas, -x, -y);
        return cropped;
    }

    fill(style) {
        this.#ctx.fillStyle = style;
        this.#ctx.fillRect(0, 0, this.w, this.h);
    }
}

class EasyPixel {

    constructor(easyCanvas, i) {
        this.easyCanvas = easyCanvas;
        this.i = i;
    }

    get x() {
        return this.i % this.easyCanvas.w;
    }

    get rx() {
        return this.easyCanvas.w - this.x;
    }

    get y() {
        return Math.floor(this.i / this.easyCanvas.w);
    }

    get ry() {
        return this.easyCanvas.h - this.y;
    }

    get xy() {
        return [this.x, this.y];
    }

    get r() {
        return this.easyCanvas[_data][this.i * 4];
    }

    get g() {
        return this.easyCanvas[_data][this.i * 4 + 1];
    }

    get b() {
        return this.easyCanvas[_data][this.i * 4 + 2];
    }

    set rgb(rgb) {
        const data = this.easyCanvas[_data];
        const j = this.i * 4;

        if (typeof rgb === 'number') {
            data[j] = data[j + 1] = data[j + 2] = rgb;
        } else {
            data[j] = rgb[0];
            data[j + 1] = rgb[1];
            data[j + 2] = rgb[2];
        }
    }

    get rgb() {
        const data = this.easyCanvas[_data];
        const j = this.i * 4;
        return [data[j], data[j + 1], data[j + 2]];
    }

    set a(a) {
        const data = this.easyCanvas[_data];
        const j = this.i * 4;
        data[j + 3] = a;
    }
}
