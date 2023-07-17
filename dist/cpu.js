"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSet = exports.CPU = void 0;
const instruction_1 = require("./Assembler/instruction");
const binaryFunctions_1 = require("./binaryFunctions");
class CPU {
    constructor(ram, instructionPointer) {
        this.ram = ram;
        this.instructionPointer = instructionPointer;
        this.registerSet = new RegisterSet(32);
    }
    executeInstruction(instruction) {
        const instructionType = opcodeTypeTable.get((0, binaryFunctions_1.getRange)(instruction, 6, 0));
        switch (instructionType) {
            case instruction_1.InstructionType.R:
                this.executeR_Type(new instruction_1.R_Type({ binary: instruction }));
                break;
            case instruction_1.InstructionType.I:
                this.executeI_Type(new instruction_1.I_Type({ binary: instruction }));
                break;
            case instruction_1.InstructionType.S:
                this.executeS_Type(new instruction_1.S_Type({ binary: instruction }));
                break;
            case instruction_1.InstructionType.B:
                this.executeB_Type(new instruction_1.B_Type({ binary: instruction }));
                break;
            case instruction_1.InstructionType.U:
                this.executeU_Type(new instruction_1.U_Type({ binary: instruction }));
                break;
            case instruction_1.InstructionType.J:
                this.executeJ_Type(new instruction_1.J_Type({ binary: instruction }));
                break;
        }
    }
    executeR_Type(instruction) {
        const { opcode, func3 } = instruction;
        // Get func3 lookup table for R_Type instructions
        const funcTable = r_TypeOpcodeTable.get(opcode);
        const operation = funcTable === null || funcTable === void 0 ? void 0 : funcTable.get(func3);
        if (operation !== undefined) {
            operation(instruction, this);
        }
        else {
            console.log('WARNING: Invalid Instruction');
        }
        this.instructionPointer += 4;
    }
    executeI_Type(instruction) {
        const { opcode, func3 } = instruction;
        // Get func3 lookup table for I_Type instructions
        const funcTable = i_TypeOpcodeTable.get(opcode);
        const operation = funcTable === null || funcTable === void 0 ? void 0 : funcTable.get(func3);
        if (operation !== undefined) {
            operation(instruction, this);
        }
        else {
            console.log('WARNING: Invalid Instruction');
        }
    }
    executeS_Type(instruction) {
        const { opcode, func3 } = instruction;
        // Get func3 lookup table for S_Type instructions
        const funcTable = s_TypeOpcodeTable.get(opcode);
        const operation = funcTable === null || funcTable === void 0 ? void 0 : funcTable.get(func3);
        if (operation !== undefined) {
            operation(instruction, this);
        }
        else {
            console.log('WARNING: Invalid Instruction');
        }
        this.instructionPointer += 4;
    }
    executeB_Type(instruction) {
        const { opcode, func3 } = instruction;
        // Get func3 lookup table for B_Type instructions
        const funcTable = b_TypeOpcodeTable.get(opcode);
        const operation = funcTable === null || funcTable === void 0 ? void 0 : funcTable.get(func3);
        if (operation !== undefined) {
            operation(instruction, this);
        }
        else {
            console.log('WARNING: Invalid Instruction');
        }
    }
    executeU_Type(instruction) {
        const { opcode } = instruction;
        // Get func3 lookup table for U_Type instructions
        const operation = u_TypeOpcodeTable.get(opcode);
        if (operation !== undefined) {
            operation(instruction, this);
        }
        else {
            console.log('WARNING: Invalid Instruction');
        }
        this.instructionPointer += 4;
    }
    executeJ_Type(instruction) {
        const { opcode } = instruction;
        // Get func3 lookup table for J_Type instructions
        const operation = j_TypeOpcodeTable.get(opcode);
        if (operation !== undefined) {
            operation(instruction, this);
        }
        else {
            console.log('WARNING: Invalid Instruction');
        }
    }
}
exports.CPU = CPU;
class RegisterSet {
    constructor(numRegisters) {
        this.registerBuffer = new ArrayBuffer(numRegisters * 4);
        this.registerView = new DataView(this.registerBuffer);
    }
    getRegister(index) {
        if (index === 0) {
            return 0;
        }
        return this.registerView.getInt32(index * 4, true);
    }
    getRegisterU(index) {
        if (index === 0) {
            return 0;
        }
        return this.registerView.getUint32(index * 4, true);
    }
    setRegister(index, value) {
        if (index === 0) {
            return;
        }
        this.registerView.setInt32(index * 4, value, true);
    }
    setRegisterU(index, value) {
        if (index === 0) {
            return;
        }
        this.registerView.setUint32(index * 4, value, true);
    }
}
exports.RegisterSet = RegisterSet;
const opcode0x03func3Table = new Map([
    [0x0, (instruction, cpu) => {
            // TODO: Implement LB
        }],
    [0x1, (instruction, cpu) => {
            // TODO: Implement LH
        }],
    [0x2, (instruction, cpu) => {
            // TODO: Implement LW
        }],
    [0x4, (instruction, cpu) => {
            // TODO: Implement LBU
        }],
    [0x5, (instruction, cpu) => {
            // TODO: Implement LHU
        }],
]);
const opcode0x13func3Table = new Map([
    [0x0, (instruction, cpu) => {
            // TODO: Implement ADDI
        }],
    [0x1, (instruction, cpu) => {
            // TODO: Implement SLLI
        }],
    [0x2, (instruction, cpu) => {
            // TODO: Implement SLTI
        }],
    [0x3, (instruction, cpu) => {
            // TODO: Implement SLTIU
        }],
    [0x4, (instruction, cpu) => {
            // TODO: Implement XORI
        }],
    [0x5, (instruction, cpu) => {
            const { rd, rs1, imm, func7, shamt } = instruction;
            if (func7 === 0x00) {
                // TODO: Implement SRLI
            }
            else if (func7 === 0x20) {
                // TODO: Implement SRAI
            }
        }],
    [0x6, (instruction, cpu) => {
            // TODO: Implement ORI
        }],
    [0x7, (instruction, cpu) => {
            // TODO: Implement ANDI
        }],
]);
const opcode0x23func3Table = new Map([
    [0x0, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            // TODO: Implement SB
        }],
    [0x1, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            // TODO: Implement SH
        }],
    [0x2, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            // TODO: Implement SW
        }],
]);
const opcode0x33func3Table = new Map([
    [0x0, (instruction, cpu) => {
            const { rd, rs1, rs2, func7 } = instruction;
            const { registerSet } = cpu;
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
        }],
    [0x1, (instruction, cpu) => {
            const { rd, rs1, rs2 } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            const result = rs1Value << rs2Value;
            registerSet.setRegister(rd, result);
        }],
    [0x2, (instruction, cpu) => {
            const { rd, rs1, rs2 } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            const result = rs1Value < rs2Value ? 1 : 0;
            registerSet.setRegister(rd, result);
        }],
    [0x3, (instruction, cpu) => {
            const { rd, rs1, rs2 } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegisterU(rs1);
            const rs2Value = registerSet.getRegisterU(rs2);
            const result = rs1Value < rs2Value ? 1 : 0;
            registerSet.setRegister(rd, result);
        }],
    [0x4, (instruction, cpu) => {
            const { rd, rs1, rs2 } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            const result = rs1Value ^ rs2Value;
            registerSet.setRegister(rd, result);
        }],
    [0x5, (instruction, cpu) => {
            const { rd, rs1, rs2, func7 } = instruction;
            const { registerSet } = cpu;
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
        }],
    [0x6, (instruction, cpu) => {
            const { rd, rs1, rs2 } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            const result = rs1Value | rs2Value;
            registerSet.setRegister(rd, result);
        }],
    [0x7, (instruction, cpu) => {
            const { rd, rs1, rs2 } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            const result = rs1Value & rs2Value;
            registerSet.setRegister(rd, result);
        }],
]);
const opcode0x63func3Table = new Map([
    [0x0, (instruction, cpu) => {
            // TODO: Implement BEQ
        }],
    [0x1, (instruction, cpu) => {
            // TODO: Implement BNE
        }],
    [0x4, (instruction, cpu) => {
            // TODO: Implement BLT
        }],
    [0x5, (instruction, cpu) => {
            // TODO: Implement BGE
        }],
    [0x6, (instruction, cpu) => {
            // TODO: Implement BLTU
        }],
    [0x7, (instruction, cpu) => {
            // TODO: Implement BGEU
        }],
]);
const opcode0x67func3Table = new Map([
    [0x0, (instruction, cpu) => {
            // TODO: Implement JALR
        }]
]);
const opcode0x73func3Table = new Map([
    [0x0, (instruction, cpu) => {
            // TODO: Implement ECALL
        }]
]);
const r_TypeOpcodeTable = new Map([
    [0x33, opcode0x33func3Table]
]);
const i_TypeOpcodeTable = new Map([
    [0x03, opcode0x03func3Table],
    [0x13, opcode0x13func3Table],
    [0x67, opcode0x67func3Table],
    [0x73, opcode0x73func3Table]
]);
const s_TypeOpcodeTable = new Map([
    [0x23, opcode0x23func3Table]
]);
const b_TypeOpcodeTable = new Map([
    [0x63, opcode0x63func3Table]
]);
const u_TypeOpcodeTable = new Map([
    [0x37, (instruction, cpu) => {
            // TODO: Implement LUI
        }],
    [0x17, (instruction, cpu) => {
            // TODO: Implement AUIPC
        }]
]);
const j_TypeOpcodeTable = new Map([
    [0x6F, (instruction, cpu) => {
            // TODO: Implement JAL
        }]
]);
const opcodeTypeTable = new Map([
    [0x03, instruction_1.InstructionType.I],
    [0x13, instruction_1.InstructionType.I],
    [0x17, instruction_1.InstructionType.U],
    [0x23, instruction_1.InstructionType.S],
    [0x33, instruction_1.InstructionType.R],
    [0x37, instruction_1.InstructionType.U],
    [0x63, instruction_1.InstructionType.B],
    [0x67, instruction_1.InstructionType.I],
    [0x6F, instruction_1.InstructionType.J],
    [0x73, instruction_1.InstructionType.I],
]);
