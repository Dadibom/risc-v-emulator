import { getBit, getRange, bitmask } from "../binaryFunctions";

export abstract class Instruction {

  opcode: number

  constructor(public binary: number) {
    this.opcode = getRange(binary, 6, 0);
  }

}

interface HasImmediate {
  imm: number
}

export class R_Type extends Instruction {

  rd: number;
  func3: number;
  rs1: number;
  rs2: number;
  func7: number;

  constructor(opcode: number) {
    super(opcode);

    this.rd = getRange(this.binary, 11, 6);
    this.func3 = getRange(this.binary, 14, 12);
    this.rs1 = getRange(this.binary, 19, 15);
    this.rs2 = getRange(this.binary, 24, 20);
    this.func7 = getRange(this.binary, 31, 25);

  }

}

export class I_Type extends Instruction implements HasImmediate {

  rd: number
  func3: number
  rs1: number
  imm12: number
  func7: number
  shamt: number

  imm: number

    constructor(opcode: number) {
    super(opcode);

    this.rd = getRange(this.binary, 11, 6);
    this.func3 = getRange(this.binary, 14, 12);
    this.rs1 = getRange(this.binary, 19, 15);
    this.imm12 = getRange(this.binary, 31, 20);
    this.func7 = getRange(this.binary, 31, 25);
    this.shamt = getRange(this.binary, 24, 20);

    this.imm = this.imm12;

  }

}

export class S_Type extends Instruction implements HasImmediate {

  imm5: number
  func3: number
  rs1: number
  rs2: number
  imm7: number

  imm: number

    constructor(opcode: number) {
    super(opcode);

    this.imm5 = getRange(this.binary, 11, 7);
    this.func3 = getRange(this.binary, 14, 12);
    this.rs1 = getRange(this.binary, 19, 15);
    this.rs2 = getRange(this.binary, 24, 20);
    this.imm7 = getRange(this.binary, 31, 25);

    this.imm = this.imm5 + (this.imm7 << 13);

  }

}

export class B_Type extends Instruction implements HasImmediate {

  imm5: number
  func3: number
  rs1: number
  rs2: number
  imm7: number

  imm: number

    constructor(opcode: number) {
    super(opcode);

    this.imm5 = getRange(this.binary, 11, 6);
    this.func3 = getRange(this.binary, 14, 12);
    this.rs1 = getRange(this.binary, 19, 15);
    this.rs2 = getRange(this.binary, 24, 20);
    this.imm7 = getRange(this.binary, 31, 25);

    this.imm = (
      (getRange(this.imm5, 4, 1) << 1) +
      (getBit(this.imm5, 0) << 11) +
      (getRange(this.imm7, 5, 0) << 5) +
      (getBit(this.imm7, 6) << 12)
    )

  }

}

export class U_Type extends Instruction implements HasImmediate {

  rd: number
  imm20: number

  imm: number

    constructor(opcode: number) {
    super(opcode);

    this.rd = getRange(this.binary, 11, 6);
    this.imm20 = getRange(this.binary, 31, 12);

    this.imm = bitmask(this.binary, 31, 12);

  }

}

export class J_Type extends Instruction implements HasImmediate {

  rd: number
  imm20: number

  imm: number

    constructor(opcode: number) {
    super(opcode);

    this.rd = getRange(this.binary, 11, 6);
    this.imm20 = getRange(this.binary, 31, 12);

    let imm = this.imm20;
    this.imm = (
      (getRange(imm, 18, 9) << 1) +
      (getBit(imm, 8) << 11) +
      (getRange(imm, 7, 2) << 12) +
      (getBit(imm, 19) << 20)
    );

  }

}
