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
        const bitmask = 0xFFFFFFFF >>> (31 - upperEnd);
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
exports.getBitTestCases = new Map([
    [[32, 4], 0],
    [[32, 5], 1],
    [[32, 6], 0],
    [[24, 2], 0],
    [[24, 3], 1],
    [[24, 4], 1],
    [[24, 5], 0],
    [[48, 3], 0],
    [[48, 4], 1],
    [[48, 5], 1],
    [[0x80000000, 30], 0],
    [[0x80000000, 31], 1]
]);
exports.getRangeTestCases = new Map([
    [[0xFF, 3, 0], 0xF],
    [[0xFFFFFFFF, 31, 0], 0xFFFFFFFF],
    [[0xFFFFFFFF, 30, 0], 0x7FFFFFFF],
    [[0xFFFFFFFF, 12, 9], 0xF],
    [[0x0A0B0C0D, 23, 8], 0x0B0C]
]);
