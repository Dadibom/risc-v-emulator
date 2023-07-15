"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../Assembler/parser");
const binaryFunctions_1 = require("../binaryFunctions");
describe('Testing Parser:', () => {
    parser_1.parserTestCases.forEach((expected, input) => {
        test(`Input: ${input}`, () => {
            expect((0, parser_1.parse)(input)).toStrictEqual(expected);
        });
    });
});
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
