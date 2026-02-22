import { B_Type, I_Type, J_Type, R_Type, S_Type, U_Type, Instruction } from "./Assembler/instruction";
import { getRange } from "./binaryFunctions";

type ExtensionMap = {
  M: boolean;
};

// We're reusing the same instruction object over and over again to avoid creating new objects
const inst_j = new J_Type({ binary: 1 });
const inst_b = new B_Type({ binary: 1 });
const inst_i = new I_Type({ binary: 1 });
const inst_s = new S_Type({ binary: 1 });
const inst_u = new U_Type({ binary: 1 });
const inst_r = new R_Type({ binary: 1 });

const CSR_MSTATUS = 0x300;
const CSR_MISA = 0x301;
const CSR_MIE = 0x304;
const CSR_MTVEC = 0x305;
const CSR_MSCRATCH = 0x340;
const CSR_MEPC = 0x341;
const CSR_MCAUSE = 0x342;
const CSR_MTVAL = 0x343;
const CSR_MIP = 0x344;

const CSR_MSTATUS_MPIE = 7;
const CSR_MSTATUS_MIE = 3;

enum Privilege {
  User = 0b00,  // 0
  Supervisor = 0b01,  // 1
  // 0b10 is reserved
  Machine = 0b11,  // 3
}

export class CPU {

  registerSet: RegisterSet = new RegisterSet(32);
  ram: DataView;
  csr: Uint32Array = new Uint32Array(4096);
  currentPrivilege: Privilege = Privilege.Machine;

  extensions: ExtensionMap = {
    M: false,
  };

  constructor(ram: ArrayBuffer, public pc: number, extensions?: ExtensionMap) {
    this.ram = new DataView(ram);

    if (extensions) {
      for (const key in extensions) {
        if (!(key in this.extensions)) {
          throw new Error(`Unsupported extension: ${key}`);
        }
        this.extensions[key as keyof ExtensionMap] = extensions[key as keyof ExtensionMap];
      }
    }
  }

  executionStep() {
    const instruction = this.ram.getInt32(this.pc, true);
    this.executeInstruction(instruction);
  }

  executeInstruction(instruction: number) {
    const opcode = getRange(instruction, 6, 0);

    switch (opcode) {
      case 0x03:
        inst_i.binary = instruction;
        this.executeI_Type03(inst_i);
        break;

      case 0x13:
        inst_i.binary = instruction;
        this.executeI_Type13(inst_i);
        break;

      case 0x67:
        inst_i.binary = instruction;
        this.executeI_Type67(inst_i);
        break;

      case 0x73:
        inst_i.binary = instruction;
        this.executeI_Type73(inst_i);
        break;

      case 0x17:
        inst_u.binary = instruction;
        this.executeU_Type17(inst_u);
        break;

      case 0x37:
        inst_u.binary = instruction;
        this.executeU_Type37(inst_u);
        break;

      case 0x23:
        inst_s.binary = instruction;
        this.executeS_Type(opcode, inst_s);
        break;

      case 0x33:
        inst_r.binary = instruction;
        this.executeR_Type33(inst_r);
        break;

      case 0x63:
        inst_b.binary = instruction;
        this.executeB_Type63(inst_b);
        break;

      case 0x6F:
        inst_j.binary = instruction;
        this.executeJ_Type6F(inst_j);
        break;

      default:
        this.illegal_instruction(instruction);
        return;
    }
  }

  private executeR_Type33(instruction: R_Type) {
    const { func3, func7, rd, rs1, rs2 } = instruction;
    const { registerSet } = this;

    if (func7 == 0x01) {
      if (!this.extensions.M) {
        this.illegal_instruction(instruction.binary);
        return;
      }

      switch (func3) {
        case 0x0: {
          const rs1Value = registerSet.getRegister(rs1);
          const rs2Value = registerSet.getRegister(rs2);
          // MUL - need to keep only lower 32 bits
          const result = (rs1Value * rs2Value) | 0; // Force 32-bit signed result
          registerSet.setRegister(rd, result);
          break;
        }
        case 0x1: {
          const rs1Value = registerSet.getRegister(rs1);
          const rs2Value = registerSet.getRegister(rs2);
          // MULH - signed × signed
          // JavaScript can't directly access high 32 bits of 64-bit product
          // Need BigInt for proper 64-bit arithmetic
          const result = Number(BigInt(rs1Value) * BigInt(rs2Value) >> 32n);
          registerSet.setRegister(rd, result);
          break;
        }
        case 0x2: {
          const rs1Value = registerSet.getRegister(rs1);
          const rs2Value = registerSet.getRegisterU(rs2);
          // MULHSU - signed × unsigned
          // rs1 is signed, rs2 is unsigned
          const result = Number(BigInt(rs1Value) * BigInt(rs2Value) >> 32n);
          registerSet.setRegister(rd, result);
          break;
        }
        case 0x3: {
          const rs1Value = registerSet.getRegisterU(rs1);
          const rs2Value = registerSet.getRegisterU(rs2);
          // MULHU - unsigned × unsigned
          const result = Number(BigInt(rs1Value) * BigInt(rs2Value) >> 32n);
          registerSet.setRegister(rd, result);
          break;
        }
        case 0x4: {
          const rs1Value = registerSet.getRegister(rs1);
          const rs2Value = registerSet.getRegister(rs2);
          // DIV - signed division
          // Handle division by zero and overflow special cases
          if (rs2Value === 0) {
            registerSet.setRegister(rd, -1); // Division by zero returns -1
          } else if (rs1Value === -2147483648 && rs2Value === -1) {
            registerSet.setRegister(rd, -2147483648); // Overflow case
          } else {
            const result = Math.trunc(rs1Value / rs2Value); // Truncate toward zero
            registerSet.setRegister(rd, result);
          }
          break;
        }
        case 0x5: {
          const rs1Value = registerSet.getRegisterU(rs1);
          const rs2Value = registerSet.getRegisterU(rs2);
          // DIVU - unsigned division
          if (rs2Value === 0) {
            registerSet.setRegister(rd, -1); // Division by zero returns 2^32-1
          } else {
            const result = Math.trunc(rs1Value / rs2Value);
            registerSet.setRegister(rd, result);
          }
          break;
        }
        case 0x6: {
          const rs1Value = registerSet.getRegister(rs1);
          const rs2Value = registerSet.getRegister(rs2);
          // REM - signed remainder
          if (rs2Value === 0) {
            registerSet.setRegister(rd, rs1Value); // Remainder of division by zero is the dividend
          } else if (rs1Value === -2147483648 && rs2Value === -1) {
            registerSet.setRegister(rd, 0); // Special overflow case
          } else {
            const result = rs1Value % rs2Value;
            registerSet.setRegister(rd, result);
          }
          break;
        }
        case 0x7: {
          const rs1Value = registerSet.getRegisterU(rs1);
          const rs2Value = registerSet.getRegisterU(rs2);
          // REMU - unsigned remainder
          if (rs2Value === 0) {
            registerSet.setRegister(rd, rs1Value); // Remainder of division by zero is the dividend
          } else {
            const result = rs1Value % rs2Value;
            registerSet.setRegister(rd, result);
          }
          break;
        }

        default:
          throw new Error('Invalid Instruction');
      }

      this.pc += 4;
      return;
    }

    switch (func3) {
      case 0x0: {
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
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegisterU(rs2);

        const result = rs1Value << rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x2: {
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);

        const result = rs1Value < rs2Value ? 1 : 0;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x3: {
        const rs1Value = registerSet.getRegisterU(rs1);
        const rs2Value = registerSet.getRegisterU(rs2);

        const result = rs1Value < rs2Value ? 1 : 0;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x4: {
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);

        const result = rs1Value ^ rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x5: {
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
        const rs1Value = registerSet.getRegister(rs1);
        const rs2Value = registerSet.getRegister(rs2);

        const result = rs1Value | rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      case 0x7: {
        const rs1Value = registerSet.getRegisterU(rs1);
        const rs2Value = registerSet.getRegisterU(rs2);

        const result = rs1Value & rs2Value;
        registerSet.setRegister(rd, result);
        break;
      }
      default:
        throw new Error('Invalid Instruction');
    }

    this.pc += 4;
  }

  private executeI_Type03(instruction: I_Type) {
    const { func3, rd, rs1, imm } = instruction;
    const { registerSet, ram } = this;

    switch (func3) {
      case 0x0: {
        const rs1Value = registerSet.getRegister(rs1);

        const byte = ram.getInt8(rs1Value + imm);
        registerSet.setRegister(rd, byte);

        this.pc += 4;
        break;
      }
      case 0x1: {
        const rs1Value = registerSet.getRegister(rs1);

        const half = ram.getInt16(rs1Value + imm, true);
        registerSet.setRegister(rd, half);

        this.pc += 4;
        break;
      }
      case 0x2: {
        const rs1Value = registerSet.getRegister(rs1);

        const word = ram.getInt32(rs1Value + imm, true);
        registerSet.setRegister(rd, word);

        this.pc += 4;
        break;
      }
      case 0x4: {
        const rs1Value = registerSet.getRegister(rs1);

        const byte = ram.getUint8(rs1Value + imm);
        registerSet.setRegister(rd, byte);

        this.pc += 4;
        break;
      }
      case 0x5: {
        const rs1Value = registerSet.getRegister(rs1);

        const half = ram.getUint16(rs1Value + imm, true);
        registerSet.setRegister(rd, half);

        this.pc += 4;
        break;
      }
      default:
        throw new Error('Invalid Instruction');
    }
  }

  private executeI_Type13(instruction: I_Type) {
    const { func3, rd, rs1, imm } = instruction;
    const { registerSet } = this;
    switch (func3) {
      case 0x0: {

        const rs1Value = registerSet.getRegister(rs1);

        const result = rs1Value + imm;

        registerSet.setRegister(rd, result);

        this.pc += 4;
        break;
      }
      case 0x1: {

        const rs1Value = registerSet.getRegister(rs1);

        const result = rs1Value << instruction.shamt;

        registerSet.setRegister(rd, result);

        this.pc += 4;
        break;
      }
      case 0x2: {
        const rs1Value = registerSet.getRegister(rs1);

        const result = rs1Value < imm ? 1 : 0;

        registerSet.setRegister(rd, result);

        this.pc += 4;
        break;
      }
      case 0x3: {
        const rs1Value = registerSet.getRegisterU(rs1);

        const result = rs1Value < instruction.immU ? 1 : 0;

        registerSet.setRegister(rd, result);

        this.pc += 4;
        break;
      }
      case 0x4: {
        const rs1Value = registerSet.getRegister(rs1);

        const result = rs1Value ^ imm;

        registerSet.setRegister(rd, result);

        this.pc += 4;
        break;
      }
      case 0x5: {
        const { func7, shamt } = instruction;

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
        const rs1Value = registerSet.getRegister(rs1);

        const result = rs1Value | imm;

        registerSet.setRegister(rd, result);

        this.pc += 4;
        break;
      }
      case 0x7: {
        const rs1Value = registerSet.getRegister(rs1);

        const result = rs1Value & imm;

        registerSet.setRegister(rd, result);

        this.pc += 4;
        break;
      }
      default:
        throw new Error('Invalid Instruction');
    }
  }

  private executeI_Type67(instruction: I_Type) {
    const { func3, rd, rs1, imm } = instruction;

    if (func3 === 0x0) {
      const { registerSet } = this;

      const rs1Value = registerSet.getRegister(rs1);

      registerSet.setRegister(rd, this.pc + 4);
      this.pc = rs1Value + imm;
      return;
    } else {
      throw new Error('Invalid Instruction');
    }
  }

  set_csr(csr: number, value: number) {
    this.csr[csr] = value;
  }

  get_csr(csr: number): number {
    return this.csr[csr];
  }

  set_csr_mstatus_bit(bit: number, value: number) {
    if (value) {
      this.set_csr(CSR_MSTATUS, this.get_csr(CSR_MSTATUS) | (1 << bit));
    } else {
      this.set_csr(CSR_MSTATUS, this.get_csr(CSR_MSTATUS) & ~(1 << bit));
    }
  }

  get_csr_mstatus_bit(bit: number): number {
    return (this.get_csr(CSR_MSTATUS) >> bit) & 1;
  }

  set_csr_mstatus_privilege(privilege: Privilege) { // MPP
    // Set bits 12:11
    this.set_csr(CSR_MSTATUS, (this.get_csr(CSR_MSTATUS) & ~0b110000000000) | (privilege << 11));
  }

  get_csr_mstatus_privilege(): Privilege { // MPP
    return (this.csr[CSR_MSTATUS] & 0b110000000000) >> 11 as Privilege;
  }

  trap(cause: number, mtval: number = 0) {
    this.set_csr(CSR_MEPC, this.pc);
    this.set_csr(CSR_MCAUSE, cause);
    this.set_csr(CSR_MTVAL, mtval);
    this.set_csr_mstatus_bit(CSR_MSTATUS_MPIE, this.get_csr_mstatus_bit(CSR_MSTATUS_MIE));
    this.set_csr_mstatus_bit(CSR_MSTATUS_MIE, 0);
    this.set_csr_mstatus_privilege(this.currentPrivilege);
    this.pc = this.get_csr(CSR_MTVEC) & ~3; // Align to 4-byte boundary
    this.currentPrivilege = Privilege.Machine;
  }

  illegal_instruction(instruction: number) {
    console.error('Encountered illegal instruction:', instruction);
    this.trap(2, instruction);
  }

  is_csr_addr_readonly(csr: number): boolean {
    return ((csr >> 10) & 0x3) === 0x3;  // bits [11:10] === 11
  }

  get_csr_addr_privilege(csr: number): Privilege {
    return ((csr >> 8) & 0x3) as Privilege;  // bits [9:8]
  }

  private executeI_Type73(instruction: I_Type) {
    const { func3, rs1, rd, csr } = instruction;

    // Zicsr instructions

    switch (func3) {
      case 0b000: {
        if (instruction.binary === 0b00000000000000000000000001110011) {
          // ECALL
          const cause = this.currentPrivilege === Privilege.Machine ? 11
            : this.currentPrivilege === Privilege.Supervisor ? 9
              : 8; // User
          this.trap(cause);
          break;
        } else if (instruction.binary === 0b00000000000100000000000001110011) {
          // EBREAK
          this.trap(3);
          break;
        } else if (instruction.binary === 0b00110000001000000000000001110011) {
          // MRET
          if (this.currentPrivilege !== Privilege.Machine) {
            this.illegal_instruction(instruction.binary);
            return;
          }
          this.pc = this.csr[CSR_MEPC] + 4;
          this.currentPrivilege = this.get_csr_mstatus_privilege(); // restore privilege from MPP
          this.set_csr_mstatus_bit(CSR_MSTATUS_MIE, this.get_csr_mstatus_bit(CSR_MSTATUS_MPIE));
          this.set_csr_mstatus_bit(CSR_MSTATUS_MPIE, 1);
          this.set_csr_mstatus_privilege(Privilege.User); // clear MPP
          break;
        } else {
          this.illegal_instruction(instruction.binary);
          return;
        }
      }
      case 0b001:
        // CSRRW - CSR read and write
        if (this.is_csr_addr_readonly(csr)) {
          // Attempted write to a readonly CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        if (this.get_csr_addr_privilege(csr) > this.currentPrivilege) {
          // Not enough privilege to access the CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        if (rd !== 0) {
          this.registerSet.setRegister(rd, this.get_csr(csr));
        }
        this.set_csr(csr, this.registerSet.getRegister(rs1));
        this.pc += 4;
        break;
      case 0b010:
        // CSRRS - CSR read and set
        if (this.is_csr_addr_readonly(csr) && rs1 !== 0) {
          // Attempted write to a readonly CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        if (this.get_csr_addr_privilege(csr) > this.currentPrivilege) {
          // Not enough privilege to access the CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        this.registerSet.setRegister(rd, this.get_csr(csr));
        if (rs1 !== 0) {
          this.set_csr(csr, this.get_csr(csr) | this.registerSet.getRegister(rs1));
        }
        this.pc += 4;
        break;
      case 0b011:
        // CSRRC - CSR read and clear
        if (this.is_csr_addr_readonly(csr) && rs1 !== 0) {
          // Attempted write to a readonly CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        if (this.get_csr_addr_privilege(csr) > this.currentPrivilege) {
          // Not enough privilege to access the CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        this.registerSet.setRegister(rd, this.get_csr(csr));
        if (rs1 !== 0) {
          this.set_csr(csr, this.get_csr(csr) & ~this.registerSet.getRegister(rs1));
        }
        this.pc += 4;
        break;
      case 0b101:
        // CSRRWI - CSR read and write immediate (uimm from rs1 field, zero-extended)
        if (this.is_csr_addr_readonly(csr) && rs1 !== 0) {
          // Attempted write to a readonly CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        if (this.get_csr_addr_privilege(csr) > this.currentPrivilege) {
          // Not enough privilege to access the CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        this.registerSet.setRegister(rd, this.get_csr(csr));
        this.set_csr(csr, rs1);
        this.pc += 4;
        break;
      case 0b110:
        // CSRRSI - CSR read and set immediate (uimm from rs1 field)
        if (this.is_csr_addr_readonly(csr) && rs1 !== 0) {
          // Attempted write to a readonly CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        if (this.get_csr_addr_privilege(csr) > this.currentPrivilege) {
          // Not enough privilege to access the CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        this.registerSet.setRegister(rd, this.get_csr(csr));
        if (rs1 !== 0) {
          this.set_csr(csr, this.get_csr(csr) | rs1);
        }
        this.pc += 4;
        break;
      case 0b111:
        // CSRRCI - CSR read and clear immediate (uimm from rs1 field)
        if (this.is_csr_addr_readonly(csr) && rs1 !== 0) {
          // Attempted write to a readonly CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        if (this.get_csr_addr_privilege(csr) > this.currentPrivilege) {
          // Not enough privilege to access the CSR
          this.illegal_instruction(instruction.binary);
          return;
        }
        this.registerSet.setRegister(rd, this.get_csr(csr));
        if (rs1 !== 0) {
          this.set_csr(csr, this.get_csr(csr) & ~rs1);
        }
        this.pc += 4;
        break;

      default:
        this.illegal_instruction(instruction.binary);
        return;
    }
  }

  private executeS_Type(opcode: number, instruction: S_Type) {

    const { func3 } = instruction;

    if (opcode !== 0x23) {
      this.illegal_instruction(instruction.binary);
      return;
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
        this.illegal_instruction(instruction.binary);
        return;
    }

    this.pc += 4;

  }

  private executeB_Type63(instruction: B_Type) {

    const { func3, rs1, rs2, imm } = instruction;

    switch (func3) {
      case 0x0: {
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
        this.illegal_instruction(instruction.binary);
        return;
    }
  }

  private executeU_Type37(instruction: U_Type) {
    const { rd, immU } = instruction;

    this.registerSet.setRegister(rd, immU);

    this.pc += 4;
  }

  private executeU_Type17(instruction: U_Type) {
    const { rd, immU } = instruction;

    this.registerSet.setRegister(rd, immU + this.pc);

    this.pc += 4;
  }

  private executeJ_Type6F(instruction: J_Type) {
    const { rd, imm } = instruction;

    this.registerSet.setRegister(rd, this.pc + 4);
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
