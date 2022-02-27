import { range } from 'src/GridFromImage/Util';

const _data = Symbol();

export type EasyPixel = EasyPixelImpl;

export default class EasyCanvas {
    #factory;
    #doNotUseCanvas;
    #ctx;
    #imgData;
    #pixels;
    w;
    h;

    constructor(factory: (w: number, h: number) => HTMLCanvasElement, w: number, h: number) {
        this.#factory = factory;
        this.#doNotUseCanvas = factory(w, h);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#ctx = this.#doNotUseCanvas.getContext('2d')!;
        this.#imgData = this.#ctx.getImageData(0, 0, w, h);

        this.w = w;
        this.h = h;

        this.#pixels = range(0, this.w * this.h).map(i => new EasyPixelImpl(this, i));
    }

    get canvas() {
        this.#ctx.putImageData(this.#imgData, 0, 0);
        return this.#doNotUseCanvas;
    }

    drawImage(image: CanvasImageSource, x = 0, y = 0) {
        this.#ctx.drawImage(image, x, y);
        this.#imgData = this.#ctx.getImageData(0, 0, this.w, this.h);
    }

    get pixels() {
        return this.#pixels;
    }

    pixel(x: number, y: number) {
        return this.#pixels[y * this.w + x];
    }

    get [_data]() {
        return this.#imgData.data;
    }

    clone() {
        const cloned = new EasyCanvas(this.#factory, this.w, this.h);
        cloned.drawImage(this.canvas);
        return cloned;
    }

    crop(topLeft: EasyPixel, bottomRight: EasyPixel) {
        const { x, y } = topLeft;
        const w = bottomRight.x - x + 1;
        const h = bottomRight.y - y + 1;

        const cropped = new EasyCanvas(this.#factory, w, h);
        cropped.drawImage(this.canvas, -x, -y);
        return cropped;
    }

    fill(style: string) {
        this.#ctx.fillStyle = style;
        this.#ctx.fillRect(0, 0, this.w, this.h);
        this.#imgData = this.#ctx.getImageData(0, 0, this.w, this.h);
    }
}

class EasyPixelImpl {
    easyCanvas;
    i;

    constructor(easyCanvas: EasyCanvas, i: number) {
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

    setRGB(rgb: number | [number, number, number]) {
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

    get rgb(): [number, number, number] {
        const data = this.easyCanvas[_data];
        const j = this.i * 4;
        return [data[j], data[j + 1], data[j + 2]];
    }

    set a(a: number) {
        const data = this.easyCanvas[_data];
        const j = this.i * 4;
        data[j + 3] = a;
    }

    get a() {
        const data = this.easyCanvas[_data];
        const j = this.i * 4;
        return data[j + 3];
    }
}
