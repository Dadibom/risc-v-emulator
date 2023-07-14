// Returns bits from 32-bit input in specified range
export function getRange(input: number, upperEnd: number, lowerEnd: number): number {
  if (
    upperEnd > 31 ||
    lowerEnd < 0 ||
    lowerEnd > upperEnd ||
    lowerEnd === upperEnd
  ) {
    console.log("Warning: range not possible");
    return 0;
  }

  let result = input;

  if (upperEnd < 31) {
    const bitmask: number = 0xFFFFFFFF >>> (31 - upperEnd);
    result &= bitmask;
  }

  return result >>> lowerEnd;

}

// Returns specified bit from 32-bit input
export function getBit(input: number, index: number): number {
  if (
    index > 31 ||
    index < 0
  ) {
      console.log("Warning: Bit accessed out of range");
      return 0;
  }

  return (input >>> index) & 0x00000001
}

export function bitmask(input: number, upperEnd: number, lowerEnd: number, maskAs: boolean = false,): number {
  if (
    upperEnd > 31 ||
    lowerEnd < 0 ||
    lowerEnd > upperEnd ||
    lowerEnd === upperEnd
  ) {
    console.log("Warning: range not possible");
    return 0;
  }

  if (maskAs) {
    const mask = ((0xFFFFFFFF << (31 - (upperEnd - lowerEnd))) >> (31 - upperEnd));
    return input | ~mask;
  } else {
    const mask = ((0xFFFFFFFF << (31 - (upperEnd - lowerEnd))) >> (31 - upperEnd));
    return input & mask;
  }

}

export const getBitTestCases: Map<number[], number> = new Map([
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

export const getRangeTestCases: Map<number[], number> = new Map([
  [[0xFF, 3, 0], 0xF],
  [[0xFFFFFFFF, 31, 0], 0xFFFFFFFF],
  [[0xFFFFFFFF, 30, 0], 0x7FFFFFFF],
  [[0xFFFFFFFF, 12, 9], 0xF],
  [[0x0A0B0C0D, 23, 8], 0x0B0C]
]);