"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSet = exports.CPU = void 0;
const instruction_1 = require("./Assembler/instruction");
const binaryFunctions_1 = require("./binaryFunctions");
// We're reusing the same instruction object over and over again to avoid creating new objects
const inst_j = new instruction_1.J_Type({ binary: 1 });
const inst_b = new instruction_1.B_Type({ binary: 1 });
const inst_i = new instruction_1.I_Type({ binary: 1 });
const inst_s = new instruction_1.S_Type({ binary: 1 });
const inst_u = new instruction_1.U_Type({ binary: 1 });
const inst_r = new instruction_1.R_Type({ binary: 1 });
class CPU {
    constructor(ram, pc, extensions) {
        this.pc = pc;
        this.registerSet = new RegisterSet(32);
        this.extensions = {
            M: false,
        };
        this.ram = new DataView(ram);
        if (extensions) {
            for (const key in extensions) {
                if (!(key in this.extensions)) {
                    throw new Error(`Unsupported extension: ${key}`);
                }
                this.extensions[key] = extensions[key];
            }
        }
    }
    executionStep() {
        const instruction = this.ram.getInt32(this.pc, true);
        this.executeInstruction(instruction);
    }
    executeInstruction(instruction) {
        const opcode = (0, binaryFunctions_1.getRange)(instruction, 6, 0);
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
                throw new Error('Invalid Instruction');
        }
    }
    executeR_Type33(instruction) {
        const { func3, func7, rd, rs1, rs2 } = instruction;
        const { registerSet } = this;
        if (func7 == 0x01) {
            if (!this.extensions.M) {
                throw new Error('Invalid Instruction (M extension required)');
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
                    }
                    else if (rs1Value === -2147483648 && rs2Value === -1) {
                        registerSet.setRegister(rd, -2147483648); // Overflow case
                    }
                    else {
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
                    }
                    else {
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
                    }
                    else if (rs1Value === -2147483648 && rs2Value === -1) {
                        registerSet.setRegister(rd, 0); // Special overflow case
                    }
                    else {
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
                    }
                    else {
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
                }
                else if (func7 === 0x20) {
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
                }
                else if (func7 === 0x20) {
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
    executeI_Type03(instruction) {
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
    executeI_Type13(instruction) {
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
                }
                else if (func7 === 0x20) {
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
    executeI_Type67(instruction) {
        const { func3, rd, rs1, imm } = instruction;
        if (func3 === 0x0) {
            const { registerSet } = this;
            const rs1Value = registerSet.getRegister(rs1);
            registerSet.setRegister(rd, this.pc + 4);
            this.pc = rs1Value + imm;
            return;
        }
        else {
            throw new Error('Invalid Instruction');
        }
    }
    executeI_Type73(instruction) {
        const { func3 } = instruction;
        switch (func3) {
            case 0x0: {
                // TODO: Implement ECALL
                throw new Error('ECALL not implemented');
            }
            default:
                throw new Error('Invalid Instruction');
        }
    }
    executeS_Type(opcode, instruction) {
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
                const byte = (0, binaryFunctions_1.getRange)(rs2Value, 7, 0);
                ram.setInt8(rs1Value + imm, byte);
                break;
            }
            case 0x1: {
                const { rs1, rs2, imm } = instruction;
                const { registerSet, ram } = this;
                const rs1Value = registerSet.getRegister(rs1);
                const rs2Value = registerSet.getRegister(rs2);
                const half = (0, binaryFunctions_1.getRange)(rs2Value, 15, 0);
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
    executeB_Type63(instruction) {
        const { func3, rs1, rs2, imm } = instruction;
        switch (func3) {
            case 0x0: {
                const { registerSet } = this;
                const rs1Value = registerSet.getRegister(rs1);
                const rs2Value = registerSet.getRegister(rs2);
                if (rs1Value === rs2Value) {
                    this.pc += imm;
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
                    this.pc += 4;
                }
                break;
            }
            default:
                throw new Error('Invalid Instruction');
        }
    }
    executeU_Type37(instruction) {
        const { rd, imm } = instruction;
        this.registerSet.setRegister(rd, imm);
        this.pc += 4;
    }
    executeU_Type17(instruction) {
        const { rd, imm } = instruction;
        this.registerSet.setRegister(rd, imm + this.pc);
        this.pc += 4;
    }
    executeJ_Type6F(instruction) {
        const { rd, imm } = instruction;
        this.registerSet.setRegister(rd, this.pc + 4);
        this.pc += imm;
    }
}
exports.CPU = CPU;
class RegisterSet {
    constructor(numRegisters) {
        this.registers = new Int32Array(numRegisters);
    }
    getRegister(index) {
        return this.registers[index];
    }
    getRegisterU(index) {
        return this.registers[index] >>> 0; // Convert to unsigned
    }
    setRegister(index, value) {
        // Register 0 is hardwired to zero in RISC-V. We don't need to check when reading if we're not writing to it.
        if (index === 0) {
            return;
        }
        this.registers[index] = value;
    }
    setRegisterU(index, value) {
        // Register 0 is hardwired to zero in RISC-V. We don't need to check when reading if we're not writing to it.
        if (index === 0) {
            return;
        }
        this.registers[index] = value;
    }
}
exports.RegisterSet = RegisterSet;
