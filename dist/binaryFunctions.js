"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signExtend = exports.setBit = exports.getBit = exports.setRange = exports.getRange = void 0;
// Returns bits from 32-bit input in specified range
function getRange(input, upperEnd, lowerEnd) {
    /*
    @TODO keep checks for range only during testing/development
    if (
      upperEnd > 31 ||
      lowerEnd < 0 ||
      lowerEnd > upperEnd ||
      lowerEnd === upperEnd
    ) {
      throw new Error('Specified range not possible');
    }
    */
    let result = input;
    if (upperEnd < 31) {
        const bitmask = 0xFFFFFFFF >>> (31 - upperEnd);
        result &= bitmask;
    }
    return result >>> lowerEnd;
}
exports.getRange = getRange;
// Sets bits from 32-bit input in specified range to provided value
function setRange(input, value, upperEnd, lowerEnd) {
    /*
    @TODO keep checks for range and value only during testing/development
    if (
      upperEnd > 31 ||
      lowerEnd < 0 ||
      lowerEnd > upperEnd ||
      lowerEnd === upperEnd
    ) {
      throw new Error('Specified range not possible');
    }
  
    if (value > (2 ** (1 + upperEnd - lowerEnd)) - 1) {
      throw new Error(`Value does not fit within specified range; max value: ${(2 ** (1 + upperEnd - lowerEnd)) - 1}, value supplied: ${value}`);
    }
    */
    const mask = ~(((1 << (upperEnd - lowerEnd + 1)) - 1) << lowerEnd);
    return (input & mask) | ((value & ((1 << (upperEnd - lowerEnd + 1)) - 1)) << lowerEnd);
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
// Sets the specified bit to provided value in given input
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
// Sign extends input of specified width to 32 bits
function signExtend(input, width) {
    if (getBit(input, width - 1)) {
        const bitmask = 0xFFFFFFFF >> (32 - width);
        return setRange(input, bitmask, 31, width - 1);
    }
    else {
        return input;
    }
}
exports.signExtend = signExtend;
