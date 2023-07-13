"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeTestCases = exports.getBitTestCases = exports.getBit = exports.getRange = void 0;
// Returns bits from 32-bit input in specified range
function getRange(input, upperEnd, lowerEnd) {
    if (upperEnd > 31 ||
        lowerEnd < 0 ||
        lowerEnd > upperEnd ||
        lowerEnd === upperEnd)
        return null;
    let result = input;
    if (upperEnd < 31) {
        const bitmask = 0xFFFFFFFF << upperEnd;
        result &= bitmask;
    }
    return result >>> lowerEnd;
}
exports.getRange = getRange;
// Returns specified bit from 32-bit input
function getBit(input, index) {
    if (index > 31 ||
        index < 0)
        return null;
    return (input >>> index) & 0x00000001;
}
exports.getBit = getBit;
exports.getBitTestCases = [
    []
];
exports.getRangeTestCases = [];
