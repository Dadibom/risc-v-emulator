"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testParser = exports.parserTestCases = void 0;
const parser_1 = require("../parser");
exports.parserTestCases = new Map([
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
function testParser(testCases) {
    // Keep a log of failed tests
    let failedTests = new Map();
    let passedAll = true;
    testCases.forEach((expected, input) => {
        const parser = new parser_1.Parser();
        const result = parser.parse(input);
        let passed = true;
        expected.forEach((line, index) => {
            if (result[index] !== line) {
                passed = false;
                passedAll = false;
                failedTests.set(input, result);
            }
        });
    });
    if (passedAll) {
        console.log('ALL TESTS PASSED!');
    }
    else {
        failedTests.forEach((actual, input) => {
            const expected = testCases.get(input);
            console.log("\nTEST FAILED:");
            input.forEach((line) => {
                console.log(line);
            });
            console.log("\nEXPECTED:");
            expected.forEach((line) => {
                console.log(line);
            });
            console.log("\nACTUAL:");
            actual.forEach((line) => {
                console.log(line);
            });
            console.log("");
        });
    }
}
exports.testParser = testParser;
