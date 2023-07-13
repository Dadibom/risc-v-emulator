import { Parser } from "../parser";

export const parserTestCases = new Map<string[], string[]>([
  [['NOP'], ['ADDI x0, x0, 0']],
  [['MV x3, x5'], ['ADDI x3, x5, 0']],
  [['MV t3, a5'], ['ADDI x28, x15, 0']],
  [['NOT x2, x7'], ['XORI x2, x7, 0']],
  [['NEG fp, s0'], ['SUB x8, x0, x8']],
  [['SEQZ s3, gp'], ['SLTIU x19, x3, 1']],
  [['SNEZ t2, ra'], ['SLTU x7, x0, x1']],
  [['SLTZ sp, tp'], ['SLT x2, x4, x0']],
  [['SGTZ t4, a0'], ['SLT x29, x0, x10']],
  [['RET'], ['JALR x0, 0(x1)']],
  [[
    'loop:',
    'SUB s1, s1, a3', 
    'BEQZ s1, loop'
  ], [
    'SUB x9, x9, x13',
    'BEQ x9, x0, -4'
  ]],
  [[''], ['']],
  [[''], ['']],
  [[''], ['']],
  [[''], ['']],
]);

export function testParser(testCases: Map<string[], string[]>) {

  // Keep a log of failed tests
  let failedTests: Map<string[], string[]> = new Map<string[], string[]>();
  let passedAll = true;

  testCases.forEach((expected: string[], input: string[]) => {
    const parser = new Parser();
    const result = parser.parse(input);

    let passed = true;
    expected.forEach((line: string, index: number) => {

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
    failedTests.forEach((actual: string[], input: string[]) => {

      const expected = testCases.get(input)!!;

      console.log("\nTEST FAILED:");
      input.forEach((line: string) => {
        console.log(line);
      })

      console.log("\nEXPECTED:");
      expected.forEach((line: string) => {
        console.log(line);
      })

      console.log("\nACTUAL:");
      actual.forEach((line: string) => {
        console.log(line);
      })

      console.log("");
    })
  }

}