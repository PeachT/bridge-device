/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful type checking of our reducers.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels
 * are unique.
 */

const typeCache: { [label: string]: boolean } = {};
export function type<T>(label: T | ''): T {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    if (typeCache[<string>label]) {
        throw new Error(`Action type "label" is not unique"`);
    }

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    typeCache[<string>label] = true;

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    return <T>label;
}
