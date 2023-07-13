
export function testFunction<T, U>(unit: (input: T) => U, testCases: Map<T, U>): void {
  // Keep a log of failed tests
  let failedTests: Map<T, U> = new Map<T, U>();
  let passedAll = true;

  testCases.forEach((expected: U, input: T) => {
    const result = unit(input);

    let passed = true;

    if (result != expected) {
      passed = false;
      passedAll = false;
      failedTests.set(input, result);
    }

  })

  if (passedAll) {
    console.log('ALL TESTS PASSED!');
  } else {
    failedTests.forEach((actual: U, input: T) => {

      const expected = testCases.get(input)!!;

      console.log(`\nTEST FAILED: ${input}`);
      console.log(`\nEXPECTED: ${expected}`);
      console.log(`\nACTUAL: ${actual}`);

      console.log("");
    })
  }
}

export function testArrayFunction<T, U>(unit: (input: T[]) => U[], testCases: Map<T[], U[]>): void {
  // Keep a log of failed tests
  let failedTests: Map<T[], U[]> = new Map<T[], U[]>();
  let passedAll = true;

  testCases.forEach((expected: U[], input: T[]) => {
    const result = unit(input);

    let passed = true;

    expected.forEach((line: U, index: number) => {

      if (result[index] !== line) {
        passed = false;
        passedAll = false;
        failedTests.set(input, result);
      }

    })

  })

  if (passedAll) {
    console.log('ALL TESTS PASSED!');
  } else {
    failedTests.forEach((actual: U[], input: T[]) => {

      const expected = testCases.get(input)!!;

      console.log("\nTEST FAILED:");
      input.forEach((value: T) => console.log(value));

      console.log(`\nEXPECTED: ${expected}`);
      expected.forEach((value: U) => console.log(value));

      console.log("\nACTUAL:");
      actual.forEach((value: U) => console.log(value));

      console.log("");
    })
  }
}
