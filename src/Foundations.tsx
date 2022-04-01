/**
 * Use this to declare tuples with implicit type support
 */
export const tuple = <T extends unknown[]>(...items: T): T => items;
