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

  executeR_Type(instruction: R_Type) {
    // TODO: Implement R-Type execution

    const { rd, rs1, rs2, func3, func7 } = instruction;

    switch (func3) {
      case 0x0:
        if (func7 === 0x00) {
          // TODO: Implement ADD
        } else if (func7 === 0x20) {
          // TODO: Implement SUB
        }
        break;

      case 0x1:
        // TODO: Implement SLL
        break;

      case 0x2:
        // TODO: Implement SLT
        break;

      case 0x3:
        // TODO: Implement SLTU
        break;

      case 0x4:
        // TODO: Implement XOR
        break;

      case 0x5:
        if (func7 === 0x00) {
          // TODO: Implement SRL
        } else if (func7 === 0x20) {
          // TODO: Implement SRA
        }
        break;

      case 0x6:
        // TODO: Implement OR
        break;

      case 0x7:
        // TODO: Implement AND
        break;

      default:
        console.log("WARNING: Invalid instruction");

    }

    this.instructionPointer += 4;

  }

  executeI_Type(instruction: I_Type) {
    // TODO: Implement I-Type execution
    
    const { opcode, rd, rs1, imm, func3, func7, shamt } = instruction;

    switch (opcode) {
      case 0x67:
        // TODO: Implement JALR
        break;

      case 0x03:

        switch (func3) {
          case 0x0:
            // TODO: Implement LB
            break;

          case 0x1:
            // TODO: Implement LH
            break;

          case 0x2:
            // TODO: Implement LW
            break;

          case 0x4:
            // TODO: Implement LBU
            break;

          case 0x5:
            // TODO: Implement LHU
            break;

          default:
            console.log('WARNING: Invalid instruction');
        }

        this.instructionPointer += 4;

        break;

      case 0x13:

        switch (func3) {
          case 0x0:
            // TODO: Implement ADDI
            break;

          case 0x2:
            // TODO: Implement SLTI
            break;

          case 0x3:
            // TODO: Implement SLTIU
            break;

          case 0x4:
            // TODO: Implement XORI
            break;

          case 0x6:
            // TODO: Implement ORI
            break;

          case 0x7:
            // TODO: Implement ANDI
            break;

          case 0x1:
            // TODO: Implement SLLI
            break;

          case 0x5:
            if (func7 === 0x00) {
              // TODO: Implement SRLI
            } else if (func7 === 0x20) {
              // TODO: Implement SRAI
            }
            break;

          default:
            console.log('WARNING: Invalid instruction');
        }

        this.instructionPointer += 4;

        break;

      case 0x73:
        // TODO: Implement ECALL
        break;

      default:
        console.log('WARNING: Invalid instruction');
    }

  }

  executeS_Type(instruction: S_Type) {

    const { rs1, rs2, imm, func3 } = instruction;

    switch (func3) {
      case 0x0:
        //TODO: Implement SB
        break;

      case 0x1:
        // TODO: Implement SH
        break;

      case 0x2:
        // TODO: Implement SW
        break;

      default:
        console.log("WARNING: Invalid instruction");
    }

  }

  executeB_Type(instruction: B_Type) {

    const { rs1, rs2, imm, func3 } = instruction;

    switch (func3) {
      case 0x0:
        // TODO: Implement BEQ
        break;

      case 0x1:
        // TODO: Implement BNE
        break;

      case 0x4:
        // TODO: Implement BLT
        break;

      case 0x5:
        // TODO: Implement BGE
        break;

      case 0x6:
        // TODO: Implement BLTU
        break;

      case 0x7:
        // TODO: Implement BGEU
        break;

      default:
        console.log("WARNING: Invalid instruction");
    }

  }

  executeU_Type(instruction: U_Type) {
    
    const { opcode, rd, imm } = instruction;

    if (opcode === 0x37) {
      // TODO: Implement LUI
    } else if (opcode === 0x17) {
      // TODO: Implement AUIPC
    }

    this.instructionPointer += 4;
  }

  executeJ_Type(instruction: J_Type) {
    // TODO: Implement JAL (Only J instruction in RV32I)

    const { rd, imm } = instruction;
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