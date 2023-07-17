"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assembler_1 = require("../Assembler/assembler");
const binaryFunctions_1 = require("../binaryFunctions");
const cpu_1 = require("../cpu");
// describe('Testing Parser:', () => {
//   parserTestCases.forEach((expected: string[], input: string[]) => {
//     test(`Input: ${input}`, () => {
//       expect(parse(input)).toStrictEqual(expected);
//     });
//   })
// });
describe('Testing getBit function:', () => {
    binaryFunctions_1.getBitTestCases.forEach((expected, input) => {
        test(`Input: ${input[0]}, ${input[1]}`, () => {
            expect((0, binaryFunctions_1.getBit)(input[0], input[1])).toBe(expected);
        });
    });
});
describe('Testing setBit function:', () => {
    binaryFunctions_1.setBitTestCases.forEach((expected, input) => {
        test(`Input: ${input[0]}, ${input[1]}, ${input[2]}`, () => {
            expect((0, binaryFunctions_1.setBit)(input[0], input[1], input[2])).toBe(expected);
        });
    });
});
describe('Testing getRange function:', () => {
    binaryFunctions_1.getRangeTestCases.forEach((expected, input) => {
        test(`Input: ${input[0]}, ${input[1]}, ${input[2]}`, () => {
            expect((0, binaryFunctions_1.getRange)(input[0], input[1], input[2])).toBe(expected);
        });
    });
});
describe('Testing setRange function:', () => {
    binaryFunctions_1.setRangeTestCases.forEach((expected, input) => {
        test(`Input: ${input[0]}, ${input[1]}, ${input[2]}, ${input[3]}`, () => {
            expect((0, binaryFunctions_1.setRange)(input[0], input[1], input[2], input[3])).toBe(expected);
        });
    });
});
describe('Testing assembleLine function:', () => {
    test('Input: addi, x17, x0, 93', () => {
        expect((0, assembler_1.assembleLine)('addi, x17, x0, 93')).toHaveProperty('binary', 0x05D00893);
    });
    test('Input: add fp, a2, t4', () => {
        expect((0, assembler_1.assembleLine)('add fp, a2, t4')).toHaveProperty('binary', 0x01D60433);
    });
});
describe('Testing RegisterSet class:', () => {
    test('Set x1 to 5', () => {
        const registerSet = new cpu_1.RegisterSet(32);
        registerSet.setRegister(1, 5);
        expect(registerSet.getRegister(1)).toBe(5);
    });
});
describe('Testing R-Type instruction execution:', () => {
    test('Add 3 + 5, place the result in x3', () => {
        const cpu = new cpu_1.CPU(new ArrayBuffer(0), 0);
        cpu.registerSet.setRegister(1, 3);
        cpu.registerSet.setRegister(2, 5);
        expect(cpu.registerSet.getRegister(1)).toBe(3);
        expect(cpu.registerSet.getRegister(2)).toBe(5);
        const addInstruction = (0, assembler_1.assembleLine)('add x3, x1, x2');
        cpu.executeInstruction(addInstruction.binary);
        expect(cpu.registerSet.getRegister(3)).toBe(8);
    });
});
describe('Testing signExtend:', () => {
    test('0xFFF as 12-bit signed int', () => {
        expect((0, binaryFunctions_1.signExtend)(0xFFF, 12)).toBe(-1);
    });
    test('0xFFF as 13-bit signed int', () => {
        expect((0, binaryFunctions_1.signExtend)(0xFFF, 13)).toBe(0xFFF);
    });
});
describe('Assembly of branch instructions:', () => {
    //test('branch')
});
describe('Testing basic toy programs:', () => {
    test('Simple add, branch, and srl instructions', () => {
        const program = [
            'add tp, ra, sp',
            'beq tp, zero, 0xC',
            'blt tp, ra, 12',
            'add gp, gp, sp',
            'add gp, gp, sp',
            'srl gp, gp, ra',
            'add zero, zero, x1',
            'add zero, zero, x1',
        ];
        const bin = (0, assembler_1.assemble)(program);
        const cpu = new cpu_1.CPU(bin, 0);
        cpu.registerSet.setRegister(1, 5);
        cpu.registerSet.setRegister(2, -8);
        cpu.registerSet.setRegister(3, 64);
        for (let i = 0; i < 6; i++) {
            cpu.executionStep();
        }
        expect(cpu.registerSet.getRegister(3)).toBe(2);
        expect(cpu.registerSet.getRegister(0)).toBe(0);
    });
});
