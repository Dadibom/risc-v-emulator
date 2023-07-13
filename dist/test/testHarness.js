"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testArrayFunction = exports.testFunction = void 0;
function testFunction(unit, testCases) {
    // Keep a log of failed tests
    let failedTests = new Map();
    let passedAll = true;
    testCases.forEach((expected, input) => {
        const result = unit(input);
        let passed = true;
        if (result != expected) {
            passed = false;
            passedAll = false;
            failedTests.set(input, result);
        }
    });
    if (passedAll) {
        console.log('ALL TESTS PASSED!');
    }
    else {
        failedTests.forEach((actual, input) => {
            const expected = testCases.get(input);
            console.log(`\nTEST FAILED: ${input}`);
            console.log(`\nEXPECTED: ${expected}`);
            console.log(`\nACTUAL: ${actual}`);
            console.log("");
        });
    }
}
exports.testFunction = testFunction;
function testArrayFunction(unit, testCases) {
    // Keep a log of failed tests
    let failedTests = new Map();
    let passedAll = true;
    testCases.forEach((expected, input) => {
        const result = unit(input);
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
            input.forEach((value) => console.log(value));
            console.log(`\nEXPECTED: ${expected}`);
            expected.forEach((value) => console.log(value));
            console.log("\nACTUAL:");
            actual.forEach((value) => console.log(value));
            console.log("");
        });
    }
}
exports.testArrayFunction = testArrayFunction;
