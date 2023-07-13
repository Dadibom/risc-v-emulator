/* 
The parser's job is to translate pseudo-instructions into sequences of native assembly

For example, there is no dedicated opcode/function combination for the MV instruction
The MV instruction is an abstraction for assembly programming
An assembler actually converts "MV rd, rs" into "ADDI rd, rs, 0"

======================================================
============   Pseudo instruction list:   ============
======================================================

LA rd, symbol (Non-PIC)      AUIPC rd, delta[31:12] + delta[11]
                             ADDI rd, rd, delta[11:0]
LA rd, symbol (PIC)          AUIPC rd, delta[31:12] + delta[11]
                             L{W|D} rd, rd, delta[11:0]
LLA rd, symbol               AUIPC rd, delta[31:12] + delta[11]
                             ADDI rd, rd, delta[11:0]
L{B|H|W|D} rd, symbol        AUIPC rd, delta[31:12] + delta[11]
                             L{B|H|W|D} rd, delta[11:0](rd)
S{B|H|W|D} rd, symbol, rt    AUIPC rt, delta[31:12] + delta[11]
                             S{B|H|W|D} rd, delta[11:0](rt)

NOP                          ADDI x0, x0, 0
LI rd, imm                   *Myriad Sequences*
MV rd, rs                    ADDI rd, rs, 0
NOT rd, rs                   XORI rd, rs, -1
NEG rd, rs                   SUB rd, x0, rs
SEQZ rd, rs                  SLTIU rd, rs, 1
SNEZ rd, rs                  SLTU rd, x0, rs
SLTZ rd, rs                  SLT rd, rs, x0
SGTZ rd, rs                  SLT rd, x0, rs

BEQZ rs, offset              BEQ rs, x0, offset
BNEZ rs, offset              BNE rs, x0, offset
BLEZ rs, offset              BGE x0, rs, offset
BGEZ rs, offset              BGE rs, x0, offset
BLTZ rs, offset              BLT rs, x0, offset
BGTZ rs, offset              BLT x0, rs, offset

BGT rs, rt, offset           BLT rt, rs, offset
BLE rs, rt, offset           BGE rt, rs, offset
BGTU rs, rt, offset          BLTU rt, rs, offset
BLEU rs, rt, offset          BGEU rt, rs, offset

J offset                     JAL x0, offset
JAL offset                   JAL x1, offset
JR rs                        JALR x0, 0(rs)
JALR rs                      JALR x1, 0(rs)
RET                          JALR x0, 0(x1)
CALL offset(12 bit)          JALR ra, ra, offset
CALL offset                  AUIPC x1, offset[31:12 + offset[11]
                             JALR x1, offset[11:0](x1)
TAIL offset                  AUIPC x6, offset[31:12] + offset[11]
                             JALR x0, offset[11:0](x6)

Source: Page 139 of Volume I: RISC-V Unprivileged ISA V20191213 

*/

export class Parser {

}