import { B_Type, I_Type, Instruction, J_Type, R_Type, S_Type, U_Type } from "./Assembler/instruction";

export class CPU {

  registerSet: RegisterSet = new RegisterSet(32);

  constructor(public ram: ArrayBuffer, public instructionPointer: number) {}
  
  executeInstruction(instruction: Instruction) {

    switch (instruction.constructor) {
      case R_Type:
        this.executeR_Type(instruction as R_Type);
        break;
      case I_Type:
        this.executeI_Type(instruction as I_Type);
        break;
      case S_Type:
        this.executeS_Type(instruction as S_Type);
        break;
      case B_Type:
        this.executeB_Type(instruction as B_Type);
        break;
      case U_Type:
        this.executeU_Type(instruction as U_Type);
        break;
      case J_Type:
        this.executeJ_Type(instruction as J_Type);
        break;
    }

  }

  private executeR_Type(instruction: R_Type) {

    const { opcode, func3 } = instruction;

    // Get func3 lookup table for R_Type instructions
    const funcTable = r_TypeOpcodeTable.get(opcode);

    const operation = funcTable?.get(func3);

    if (operation !== undefined) {
      operation(instruction, this);
    } else {
      console.log('WARNING: Invalid Instruction');
    }

    this.instructionPointer += 4;

  }

  private executeI_Type(instruction: I_Type) {
    const { opcode, func3 } = instruction;

    // Get func3 lookup table for I_Type instructions
    const funcTable = i_TypeOpcodeTable.get(opcode);

    const operation = funcTable?.get(func3);

    if (operation !== undefined) {
      operation(instruction, this);
    } else {
      console.log('WARNING: Invalid Instruction');
    }

  }

  private executeS_Type(instruction: S_Type) {

    const { opcode, func3 } = instruction;

    // Get func3 lookup table for S_Type instructions
    const funcTable = s_TypeOpcodeTable.get(opcode);

    const operation = funcTable?.get(func3);

    if (operation !== undefined) {
      operation(instruction, this);
    } else {
      console.log('WARNING: Invalid Instruction');
    }

    this.instructionPointer += 4;

  }

  private executeB_Type(instruction: B_Type) {

    const { opcode, func3 } = instruction;

    // Get func3 lookup table for B_Type instructions
    const funcTable = b_TypeOpcodeTable.get(opcode);

    const operation = funcTable?.get(func3);

    if (operation !== undefined) {
      operation(instruction, this);
    } else {
      console.log('WARNING: Invalid Instruction');
    }

  }

  private executeU_Type(instruction: U_Type) {
    const { opcode } = instruction;

    // Get func3 lookup table for U_Type instructions
    const operation = u_TypeOpcodeTable.get(opcode);

    if (operation !== undefined) {
      operation(instruction, this);
    } else {
      console.log('WARNING: Invalid Instruction');
    }

    this.instructionPointer += 4;
  }

  private executeJ_Type(instruction: J_Type) {
    const { opcode } = instruction;

    // Get func3 lookup table for J_Type instructions
    const operation = j_TypeOpcodeTable.get(opcode);

    if (operation !== undefined) {
      operation(instruction, this);
    } else {
      console.log('WARNING: Invalid Instruction');
    }
  }

}

class RegisterSet {

  private registerBuffer: ArrayBuffer;
  private registerView: DataView;

  constructor(numRegisters: number) {
    this.registerBuffer = new ArrayBuffer(numRegisters * 4);
    this.registerView = new DataView(this.registerBuffer);
  }

  getRegister(index: number): number {
    return this.registerView.getInt32(index);
  }

  getRegisterU(index: number): number {
    return this.registerView.getUint32(index);
  }

  setRegister(index: number, value: number): void {
    this.registerView.setInt32(index, value);
  }

  setRegisterU(index: number, value: number): void {
    this.registerView.setUint32(index, value);
  }

}

type OpcodeTable<T extends Instruction> = Map<number, (instruction: T, cpu: CPU) => void>;
type OpcodeFuncTable<T extends Instruction> = Map<number, Map<number, (instruction: T, cpu: CPU) => void>>;
type FuncTable<T extends Instruction> = Map<number, (instruction: T, cpu: CPU) => void>;

const opcode0x03func3Table: FuncTable<I_Type> = new Map([
  [0x0, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement LB
  }],

  [0x1, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement LH
  }],

  [0x2, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement LW
  }],

  [0x4, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement LBU
  }],

  [0x5, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement LHU
  }],
]);

const opcode0x13func3Table: FuncTable<I_Type> = new Map([
  [0x0, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement ADDI
  }],

  [0x1, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement SLLI
  }],

  [0x2, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement SLTI
  }],

  [0x3, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement SLTIU
  }],

  [0x4, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement XORI
  }],

  [0x5, (instruction: I_Type, cpu: CPU) => {
    const { rd, rs1, imm, func7, shamt } = instruction;

    if (func7 === 0x00) {
      // TODO: Implement SRLI
    } else if (func7 === 0x20) {
      // TODO: Implement SRAI
    }

  }],

  [0x6, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement ORI
  }],

  [0x7, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement ANDI
  }],
]);

const opcode0x23func3Table: FuncTable<S_Type> = new Map([
  [0x0, (instruction: S_Type, cpu: CPU) => {
    const { rs1, rs2, imm } = instruction;

    // TODO: Implement SB

  }],

  [0x1, (instruction: S_Type, cpu: CPU) => {
    const { rs1, rs2, imm } = instruction;

    // TODO: Implement SH

  }],

  [0x2, (instruction: S_Type, cpu: CPU) => {
    const { rs1, rs2, imm } = instruction;

    // TODO: Implement SW

  }],
]);

const opcode0x33func3Table: FuncTable<R_Type> = new Map([
  [0x0, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2, func7 } = instruction;

    if (func7 === 0x00) {
      // TODO: Implement ADD
    } else if (func7 === 0x20) {
      // TODO: Implement SUB
    }

  }],

  [0x1, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2 } = instruction;

    // TODO: Implement SLL

  }],

  [0x2, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2 } = instruction;

    // TODO: Implement SLT

  }],

  [0x3, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2 } = instruction;

    // TODO: Implement SLTU

  }],

  [0x4, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2 } = instruction;

    // TODO: Implement XOR

  }],

  [0x5, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2, func7 } = instruction;

    if (func7 === 0x00) {
      // TODO: Implement SRL
    } else if (func7 === 0x20) {
      // TODO: Implement SRA
    }

  }],

  [0x6, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2 } = instruction;

    // TODO: Implement OR

  }],

  [0x7, (instruction: R_Type, cpu: CPU) => {
    const { rd, rs1, rs2 } = instruction;

    // TODO: Implement AND

  }],

]);

const opcode0x63func3Table: FuncTable<B_Type> = new Map([
  [0x0, (instruction: B_Type, cpu: CPU) => {
    // TODO: Implement BEQ
  }],

  [0x1, (instruction: B_Type, cpu: CPU) => {
    // TODO: Implement BNE
  }],

  [0x4, (instruction: B_Type, cpu: CPU) => {
    // TODO: Implement BLT
  }],

  [0x5, (instruction: B_Type, cpu: CPU) => {
    // TODO: Implement BGE
  }],

  [0x6, (instruction: B_Type, cpu: CPU) => {
    // TODO: Implement BLTU
  }],

  [0x7, (instruction: B_Type, cpu: CPU) => {
    // TODO: Implement BGEU
  }],
]);

const opcode0x67func3Table: FuncTable<I_Type> = new Map([
  [0x0, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement JALR
  }]
]);

const opcode0x73func3Table: FuncTable<I_Type> = new Map([
  [0x0, (instruction: I_Type, cpu: CPU) => {
    // TODO: Implement ECALL
  }]
]);

const r_TypeOpcodeTable: OpcodeFuncTable<R_Type> = new Map([
  [0x33, opcode0x33func3Table]
]);

const i_TypeOpcodeTable: OpcodeFuncTable<I_Type> = new Map([
  [0x03, opcode0x03func3Table],
  [0x13, opcode0x13func3Table],
  [0x67, opcode0x67func3Table],
  [0x73, opcode0x73func3Table]
]);

const s_TypeOpcodeTable: OpcodeFuncTable<S_Type> = new Map([
  [0x23, opcode0x23func3Table]
]);

const b_TypeOpcodeTable: OpcodeFuncTable<B_Type> = new Map([
  [0x63, opcode0x63func3Table]
]);

const u_TypeOpcodeTable: OpcodeTable<U_Type> = new Map([
  [0x37, (instruction: U_Type, cpu: CPU) => {
    // TODO: Implement LUI
  }],

  [0x17, (instruction: U_Type, cpu: CPU) => {
    // TODO: Implement AUIPC
  }]
]); 

const j_TypeOpcodeTable: OpcodeTable<J_Type> = new Map([
  [0x6F, (instruction: J_Type, cpu: CPU) => {
    // TODO: Implement JAL
  }]
]);