export declare function testFunction<T, U>(unit: (input: T) => U, testCases: Map<T, U>): void;
export declare function testArrayFunction<T, U>(unit: (input: T[]) => U[], testCases: Map<T[], U[]>): void;
