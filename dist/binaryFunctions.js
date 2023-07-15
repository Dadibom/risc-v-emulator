"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeTestCases = exports.setBitTestCases = exports.getBitTestCases = exports.bitmask = exports.setBit = exports.getBit = exports.setRange = exports.getRange = void 0;
// Returns bits from 32-bit input in specified range
function getRange(input, upperEnd, lowerEnd) {
    if (upperEnd > 31 ||
        lowerEnd < 0 ||
        lowerEnd > upperEnd ||
        lowerEnd === upperEnd) {
        throw new Error('Specified range not possible');
    }
    let result = input;
    if (upperEnd < 31) {
        const bitmask = 0xFFFFFFFF >>> (31 - upperEnd);
        result &= bitmask;
    }
    return result >>> lowerEnd;
}
exports.getRange = getRange;
// Sets bits from 32-bit input in specified range
function setRange(input, value, upperEnd, lowerEnd) {
    if (upperEnd > 31 ||
        lowerEnd < 0 ||
        lowerEnd > upperEnd ||
        lowerEnd === upperEnd) {
        throw new Error('Specified range not possible');
    }
    if (value >= 2 ** (upperEnd - lowerEnd)) {
        throw new Error('Value does not fit within specified range');
    }
    return bitmask(input, upperEnd, lowerEnd) | value << lowerEnd;
}
exports.setRange = setRange;
// Returns specified bit from 32-bit input
function getBit(input, index) {
    if (index > 31 ||
        index < 0) {
        throw new Error('Specified index not possible');
    }
    return (input >>> index) & 0x00000001;
}
exports.getBit = getBit;
function setBit(input, value, index) {
    if (index > 31 ||
        index < 0) {
        throw new Error('Specified index not possible');
    }
    if (value !== 0 && value !== 1) {
        throw new Error(`Specified value must be 1 or 0; value received: ${value}`);
    }
    return value === 1 ?
        input | (1 << index) :
        (input | (1 << index)) ^ (1 << index);
}
exports.setBit = setBit;
function bitmask(input, upperEnd, lowerEnd, maskAs = false) {
    if (upperEnd > 31 ||
        lowerEnd < 0 ||
        lowerEnd > upperEnd ||
        lowerEnd === upperEnd) {
        throw new Error('Specified range not possible');
    }
    if (maskAs) {
        const mask = ((0xFFFFFFFF << (31 - (upperEnd - lowerEnd))) >> (31 - upperEnd));
        return input | ~mask;
    }
    else {
        const mask = ((0xFFFFFFFF << (31 - (upperEnd - lowerEnd))) >> (31 - upperEnd));
        return input & mask;
    }
}
exports.bitmask = bitmask;
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
exports.setBitTestCases = new Map([
    [[0, 1, 0], 1],
    [[0, 1, 1], 2],
    [[0, 1, 2], 4],
    [[0, 1, 3], 8],
    [[0, 1, 4], 16],
    [[0, 1, 5], 32],
    [[31, 0, 0], 30],
]);
exports.getRangeTestCases = new Map([
    [[0xFF, 3, 0], 0xF],
    [[0xFFFFFFFF, 31, 0], 0xFFFFFFFF],
    [[0xFFFFFFFF, 30, 0], 0x7FFFFFFF],
    [[0xFFFFFFFF, 12, 9], 0xF],
    [[0x0A0B0C0D, 23, 8], 0x0B0C]
]);
