import { parse, parserTestCases } from "../Assembler/parser";
import { getBit, getBitTestCases, getRange, getRangeTestCases } from "../binaryFunctions";

describe('Testing Parser:', () => {
  parserTestCases.forEach((expected: string[], input: string[]) => {
    test(`Input: ${input}`, () => {
      expect(parse(input)).toStrictEqual(expected);
    });
  })
});

describe('Testing getBit function:', () => {
  getBitTestCases.forEach((expected: number, input: number[]) => {
    test(`Input: ${input[0]}, ${input[1]}`, () => {
      expect(getBit(input[0], input[1])).toBe(expected);
    })
  })
})

describe('Testing getRange function:', () => {
  getRangeTestCases.forEach((expected: number, input: number[]) => {
    test(`Input: ${input[0]}, ${input[1]}, ${input[2]}`, () => {
      expect(getRange(input[0], input[1], input[2])).toBe(expected);
    })
  })
})
