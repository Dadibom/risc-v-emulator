import { assembleLine } from "../Assembler/assembler";
import { R_Type } from "../Assembler/instruction";
import { parse, parserTestCases } from "../Assembler/parser";
import { getBit, getBitTestCases, getRange, getRangeTestCases, setBit, setBitTestCases, setRange, setRangeTestCases } from "../binaryFunctions";
import { CPU, RegisterSet } from "../cpu";

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
});

describe('Testing setBit function:', () => {
  setBitTestCases.forEach((expected: number, input: number[]) => {
    test(`Input: ${input[0]}, ${input[1]}, ${input[2]}`, () => {
      expect(setBit(input[0], input[1], input[2])).toBe(expected);
    })
  })
});

describe('Testing getRange function:', () => {
  getRangeTestCases.forEach((expected: number, input: number[]) => {
    test(`Input: ${input[0]}, ${input[1]}, ${input[2]}`, () => {
      expect(getRange(input[0], input[1], input[2])).toBe(expected);
    })
  })
});

describe('Testing setRange function:', () => {
  setRangeTestCases.forEach((expected: number, input: number[]) => {
    test(`Input: ${input[0]}, ${input[1]}, ${input[2]}, ${input[3]}`, () => {
      expect(setRange(input[0], input[1], input[2], input[3])).toBe(expected);
    })
  })
});

describe('Testing assembleLine function:', () => {
  test('Input: addi, x17, x0, 93', () => {
    expect(assembleLine('addi, x17, x0, 93')).toHaveProperty('binary', 0x05D00893)
  })

  test('Input: add fp, a2, t4', () => {
    expect(assembleLine('add fp, a2, t4')).toHaveProperty('binary', 0x01D60433)
  })
});

describe('Testing RegisterSet class:', () => {
  test('Set x1 to 5', () => {

    const registerSet = new RegisterSet(32);

    registerSet.setRegister(1, 5);

    expect(registerSet.getRegister(1)).toBe(5);

  })
})

describe('Testing R-Type instruction execution:', () => {

  test('Add 3 + 5, place the result in x3', () => {

    const cpu = new CPU(new ArrayBuffer(0), 0);

    cpu.registerSet.setRegister(1, 3);
    cpu.registerSet.setRegister(2, 5);

    expect(cpu.registerSet.getRegister(1)).toBe(3);
    expect(cpu.registerSet.getRegister(2)).toBe(5);

    const addInstruction = assembleLine('add x3, x1, x2');

    cpu.executeInstruction(addInstruction.binary);

    expect(cpu.registerSet.getRegister(3)).toBe(8);

  });
})