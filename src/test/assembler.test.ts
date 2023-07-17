import { assembleLine } from "../Assembler/assembler";

describe('Testing assembleLine function:', () => {
  test('Input: addi, x17, x0, 93', () => {
    expect(assembleLine('addi, x17, x0, 93')).toHaveProperty('binary', 0x05D00893)
  })

  test('Input: add fp, a2, t4', () => {
    expect(assembleLine('add fp, a2, t4')).toHaveProperty('binary', 0x01D60433)
  })

  test('Input: beq tp, ra, 0xC', () => {
    expect(assembleLine('beq tp, ra, 0xC')).toHaveProperty('binary', 0x00120663)
  })
});