import { B_Type, I_Type, J_Type, R_Type, S_Type, U_Type } from "./Assembler/instruction";
import { getRange } from "./binaryFunctions";

export class CPU {

  registerSet: RegisterSet = new RegisterSet(32);
  ram: DataView;

  constructor(ram: ArrayBuffer, public pc: number) {
    this.ram = new DataView(ram);
  }

  executionStep() {
    const instruction = this.ram.getInt32(this.pc, true);
    this.executeInstruction(instruction);
  }

  executeInstruction(instruction: number) {
    const opcode = getRange(instruction, 6, 0);

    switch (opcode) {
      case 0x03:
      case 0x13:
      case 0x67:
      case 0x73:
        this.executeI_Type(opcode, new I_Type({ binary: instruction }));
        break;

      case 0x17:
      case 0x37:
        this.executeU_Type(opcode, new U_Type({ binary: instruction }));
        break;

      case 0x23:
        this.executeS_Type(opcode, new S_Type({ binary: instruction }));
        break;

      case 0x33:
        this.executeR_Type(opcode, new R_Type({ binary: instruction }));
        break;

      case 0x63:
        this.executeB_Type(opcode, new B_Type({ binary: instruction }));
        break;

      case 0x6F:
        this.executeJ_Type(opcode, new J_Type({ binary: instruction }));
        break;

      default:
        throw new Error('Invalid Instruction');
    }
  }

  private executeR_Type(opcode: number, instruction: R_Type) {

    const { func3 } = instruction;

    if (opcode !== 0x33) {
      throw new Error('Invalid Instruction');
    }

    switch (func3) {
      case 0x0: {
        const { rd, rs1, rs2, func7 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        if (func7 === 0x00) {
          const sum = rs1Value + rs2Value;
          registerSet.setRegister(rd, sum);
    
        } else if (func7 === 0x20) {
          const difference = registerSet.getRegister(rs1) - registerSet.getRegister(rs2);
          registerSet.setRegister(rd, difference);
        }
        break;
      }
      case 0x1: {
        const { rd, rs1, rs2 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegisterU(rs2);
    
        const result = rs1Value << rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x2: {
        const { rd, rs1, rs2 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        const result = rs1Value < rs2Value ? 1 : 0;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x3: {
        const { rd, rs1, rs2 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegisterU(rs1);
        const rs2Value = registerSet.getRegisterU(rs2);
    
        const result = rs1Value < rs2Value ? 1 : 0;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x4: {
       const { rd, rs1, rs2 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        const result = rs1Value ^ rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x5: {
        const { rd, rs1, rs2, func7 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        if (func7 === 0x00) {
          const result = rs1Value >>> rs2Value;
          registerSet.setRegister(rd, result);
    
        } else if (func7 === 0x20) {
          const result = rs1Value >> rs2Value;
          registerSet.setRegister(rd, result);
        }
        break;
      }
      case 0x6: {
        const { rd, rs1, rs2 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        const result = rs1Value | rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x7: {
        const { rd, rs1, rs2 } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        const result = rs1Value & rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      default:
        throw new Error('Invalid Instruction');
    }

    this.pc += 4;
  }

  private executeI_Type(opcode: number, instruction: I_Type) {
    const { func3 } = instruction;

    switch (opcode) {
      case 0x03:
        switch (func3) {
          case 0x0: {
            const { registerSet, ram } = this;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);

            const byte = ram.getInt8(rs1Value + imm);
            registerSet.setRegister(rd, byte);

            this.pc += 4;
            break;
          }
          case 0x1: {
            const { registerSet, ram } = this;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);

            const half = ram.getInt16(rs1Value + imm, true);
            registerSet.setRegister(rd, half);

            this.pc += 4;
            break;
          }
          case 0x2: {
            const { registerSet, ram } = this;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);

            const word = ram.getInt32(rs1Value + imm, true);
            registerSet.setRegister(rd, word);

            this.pc += 4;
            break;
          }
          case 0x4: {
            const { registerSet, ram } = this;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);

            const byte = ram.getUint8(rs1Value + imm);
            registerSet.setRegister(rd, byte);

            this.pc += 4;
            break;
          }
          case 0x5: {
            const { registerSet, ram } = this;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);

            const half = ram.getUint16(rs1Value + imm, true);
            registerSet.setRegister(rd, half);

            this.pc += 4;
            break;
          }
          default:
            throw new Error('Invalid Instruction');
        }
        return;
      case 0x13:

        switch (func3) {
          case 0x0: {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

            const result = rs1Value + imm;

            registerSet.setRegister(rd, result);

            this.pc += 4;
            break;
          }
          case 0x1: {
            const { rd, rs1, shamt } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

            const result = rs1Value << shamt;

            registerSet.setRegister(rd, result);

            this.pc += 4;
            break;
          }
          case 0x2: {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

            const result = rs1Value < imm ? 1 : 0;

            registerSet.setRegister(rd, result);

            this.pc += 4;
            break;
          }
          case 0x3: {
            const { rd, rs1, immU } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegisterU(rs1);

            const result = rs1Value < immU ? 1 : 0;

            registerSet.setRegister(rd, result);

            this.pc += 4;
            break;
          }
          case 0x4: {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

            const result = rs1Value ^ imm;

            registerSet.setRegister(rd, result);

            this.pc += 4;
            break;
          }
          case 0x5: {
            const { rd, rs1, func7, shamt } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

            if (func7 === 0x00) {
              const result = rs1Value >>> shamt;
              registerSet.setRegister(rd, result);

            } else if (func7 === 0x20) {
              const result = rs1Value >> shamt;
              registerSet.setRegister(rd, result);
            }

            this.pc += 4;
            break;
          }
          case 0x6: {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

            const result = rs1Value | imm;

            registerSet.setRegister(rd, result);

            this.pc += 4;
            break;
          }
          case 0x7: {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

            const result = rs1Value & imm;

            registerSet.setRegister(rd, result);

            this.pc += 4;
            break;
          }
          default:
            throw new Error('Invalid Instruction');
        }
        return;
      case 0x67:
        if (func3 === 0x0) {
          const { rd, rs1, imm } = instruction;
          const { registerSet } = this;

            const rs1Value = registerSet.getRegister(rs1);

          registerSet.setRegister(rd, this.pc + 4);
          this.pc = rs1Value + imm;
          return;
        } else {
          throw new Error('Invalid Instruction');
        }
      case 0x73:
        switch (func3) {
          case 0x0: {
            // TODO: Implement ECALL
            throw new Error('ECALL not implemented');
          }
          default:
            throw new Error('Invalid Instruction');
        }
        break;
      default:
        throw new Error('Invalid Instruction');
    }
  }

  private executeS_Type(opcode: number, instruction: S_Type) {

    const { func3 } = instruction;

    if (opcode !== 0x23) {
      throw new Error('Invalid Instruction');
    }

    switch (func3) {
      case 0x0: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet, ram } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        const byte = getRange(rs2Value, 7, 0);
    
        ram.setInt8(rs1Value + imm, byte);
        break;
      }
      case 0x1: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet, ram } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        const half = getRange(rs2Value, 15, 0);
    
        ram.setInt16(rs1Value + imm, half, true);
        break;
      }
      case 0x2: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet, ram } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        ram.setInt32(rs1Value + imm, rs2Value, true);
        break;
      }
      default:
        throw new Error('Invalid Instruction');
    }

    this.pc += 4;

  }

  private executeB_Type(opcode: number, instruction: B_Type) {

    const { func3 } = instruction;

    if (opcode !== 0x63) {
      throw new Error('Invalid Instruction');
    }

    switch (func3) {
      case 0x0: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        if (rs1Value === rs2Value) {
          this.pc += imm;
        } else {
          this.pc += 4;
        }
        break;
      }
      case 0x1: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        if (rs1Value !== rs2Value) {
          this.pc += imm;
        } else {
          this.pc += 4;
        }
        break;
      }
      case 0x4: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        if (rs1Value < rs2Value) {
          this.pc += imm;
        } else {
          this.pc += 4;
        }
        break;
      }
      case 0x5: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);
    
        if (rs1Value >= rs2Value) {
          this.pc += imm;
        } else {
          this.pc += 4;
        }
        break;
      }
      case 0x6: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegisterU(rs1);
        const rs2Value = registerSet.getRegisterU(rs2);
    
        if (rs1Value < rs2Value) {
          this.pc += imm;
        } else {
          this.pc += 4;
        }
        break;
      }
      case 0x7: {
        const { rs1, rs2, imm } = instruction;
        const { registerSet } = this;
    
        const rs1Value = registerSet.getRegisterU(rs1);
        const rs2Value = registerSet.getRegisterU(rs2);
    
        if (rs1Value >= rs2Value) {
          this.pc += imm;
        } else {
          this.pc += 4;
        }
        break;
      }
      default:
        throw new Error('Invalid Instruction');
    }
  }

  private executeU_Type(opcode: number, instruction: U_Type) {
    switch (opcode) {
      case 0x37: {
        const { rd, imm } = instruction;
        const { registerSet } = this;
    
        registerSet.setRegister(rd, imm);
        break;
      }
      case 0x17: {
        const { rd, imm } = instruction;
        const { registerSet } = this;
    
        registerSet.setRegister(rd, imm + this.pc);
        break;
      }
      default:
        throw new Error('Invalid Instruction');
    }

    this.pc += 4;
  }

  private executeJ_Type(opcode: number, instruction: J_Type) {
    if (opcode !== 0x6F) {
      throw new Error('Invalid Instruction');
    }

    const { rd, imm } = instruction;
    const { registerSet } = this;
    
    registerSet.setRegister(rd, this.pc + 4);
    this.pc += imm;
  }

}

export class RegisterSet {
  private registers: Int32Array;

  constructor(numRegisters: number) {
    this.registers = new Int32Array(numRegisters);
  }

  getRegister(index: number): number {
    return this.registers[index];
  }

  getRegisterU(index: number): number {
    return this.registers[index] >>> 0; // Convert to unsigned
  }

  setRegister(index: number, value: number): void {
    // Register 0 is hardwired to zero in RISC-V. We don't need to check when reading if we're not writing to it.
    if (index === 0) {
      return;
    }
    this.registers[index] = value;
  }

  setRegisterU(index: number, value: number): void {
    // Register 0 is hardwired to zero in RISC-V. We don't need to check when reading if we're not writing to it.
    if (index === 0) {
      return;
    }
    this.registers[index] = value;
  }
}
