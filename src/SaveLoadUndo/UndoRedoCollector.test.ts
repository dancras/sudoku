import { Subject } from 'rxjs';
import UndoRedoCollector from 'src/SaveLoadUndo/UndoRedoCollector';

it('adds undo to any collected event stream', () => {

    const exampleStream = new Subject<string>();
    const collector = new UndoRedoCollector(exampleStream, [[], []]);
    const collectionSpy = vi.fn();
    collector.collection$.subscribe(collectionSpy);

    exampleStream.next('a');
    exampleStream.next('b');
    expect(collectionSpy).toHaveBeenCalledWith([['a', 'b'], []]);

    collector.undo();
    expect(collectionSpy).toHaveBeenCalledWith([['a'], ['b']]);

    collector.undo();
    expect(collectionSpy).toHaveBeenCalledWith([[], ['b', 'a']]);

    collectionSpy.mockClear();
    collector.undo();
    expect(collectionSpy).not.toHaveBeenCalled();

});

it('adds redo to any collected event stream', () => {

    const exampleStream = new Subject<string>();
    const collector = new UndoRedoCollector(exampleStream, [[], []]);
    const collectionSpy = vi.fn();
    collector.collection$.subscribe(collectionSpy);

    exampleStream.next('a');
    exampleStream.next('b');
    collector.undo();
    collector.undo();

    collectionSpy.mockClear();

    collector.redo();
    expect(collectionSpy).toHaveBeenCalledWith([['a'], ['b']]);

    collector.redo();
    expect(collectionSpy).toHaveBeenCalledWith([['a', 'b'], []]);

    collectionSpy.mockClear();

    collector.redo();
    expect(collectionSpy).not.toHaveBeenCalled();

});

it('ignores updates while emitting an undo', () => {
    const exampleStream = new Subject<string>();
    const collector = new UndoRedoCollector(exampleStream, [[], []]);
    const collectionSpy = vi.fn();
    collector.collection$.subscribe(collectionSpy);

    collector.updates$.subscribe(() => {
        exampleStream.next('b');
    });

    exampleStream.next('a');

    collector.undo();
    expect(collectionSpy).not.toHaveBeenCalledWith([['b'], []]);

    exampleStream.next('c');
    expect(collectionSpy).toHaveBeenCalledWith([['c'], []]);
});

it('ignores updates while emitting a redo', () => {
    const exampleStream = new Subject<string>();
    const collector = new UndoRedoCollector(exampleStream, [[], []]);
    const collectionSpy = vi.fn();
    collector.collection$.subscribe(collectionSpy);

    exampleStream.next('a');
    collector.undo();

    collector.updates$.subscribe(() => {
        exampleStream.next('b');
    });

    collector.redo();
    expect(collectionSpy).not.toHaveBeenCalledWith([['b'], []]);

    exampleStream.next('c');
    expect(collectionSpy).toHaveBeenCalledWith([['a', 'c'], []]);
});

describe('updates$', () => {

    it('does not emit for regular events', () => {
        const exampleStream = new Subject<string>();
        const collector = new UndoRedoCollector(exampleStream, [[], []]);
        const updatesSpy = vi.fn();
        collector.updates$.subscribe(updatesSpy);

        exampleStream.next('a');

        expect(updatesSpy).not.toHaveBeenCalled();
    });

    it('emits an undo event with affected item when undo is called', () => {
        const exampleStream = new Subject<string>();
        const collector = new UndoRedoCollector(exampleStream, [[], []]);
        const updatesSpy = vi.fn();
        collector.updates$.subscribe(updatesSpy);

        exampleStream.next('a');
        exampleStream.next('b');
        exampleStream.next('c');
        collector.undo();

        expect(updatesSpy).toHaveBeenCalledWith({
            type: 'Undo',
            affected: 'c',
            history: ['a', 'b']
        });
    });

    it('emits a redo event with affected item when redo is called', () => {
        const exampleStream = new Subject<string>();
        const collector = new UndoRedoCollector(exampleStream, [[], []]);
        const updatesSpy = vi.fn();
        collector.updates$.subscribe(updatesSpy);

        exampleStream.next('a');
        exampleStream.next('b');
        collector.undo();

        updatesSpy.mockClear();
        collector.redo();

        expect(updatesSpy).toHaveBeenCalledWith({
            type: 'Redo',
            affected: 'b',
            history: ['a', 'b']
        });
    });

});
