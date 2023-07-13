// Returns bits from 32-bit input in specified range
export function getRange(input: number, upperEnd: number, lowerEnd: number): number | null {
  if (upperEnd > 31 ||
      lowerEnd < 0 ||
      lowerEnd > upperEnd ||
      lowerEnd === upperEnd
    ) return null;

  let result = input;

  if (upperEnd < 31) {
    const bitmask: number = 0xFFFFFFFF << upperEnd;
    result &= bitmask;
  }

  return result >>> lowerEnd;

}

// Returns specified bit from 32-bit input
export function getBit(input: number, index: number): number | null {
  if (index > 31 ||
      index < 0
    ) return null

  return (input >>> index) & 0x00000001
}

export const getBitTestCases = [
  []
]

export const getRangeTestCases = [
  
]