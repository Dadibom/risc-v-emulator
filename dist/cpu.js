"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSet = exports.CPU = void 0;
const instruction_1 = require("./Assembler/instruction");
const binaryFunctions_1 = require("./binaryFunctions");
class CPU {
    constructor(ram, pc) {
        this.pc = pc;
        this.registerSet = new RegisterSet(32);
        this.ram = new DataView(ram);
    }
    executionStep() {
        const instruction = this.ram.getInt32(this.pc, true);
        this.executeInstruction(instruction);
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
        this.pc += 4;
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
        this.pc += 4;
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
        this.pc += 4;
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
            const { registerSet, ram } = cpu;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);
            const byte = ram.getInt8(rs1Value + imm);
            registerSet.setRegister(rd, byte);
            cpu.pc += 4;
        }],
    [0x1, (instruction, cpu) => {
            const { registerSet, ram } = cpu;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);
            const half = ram.getInt16(rs1Value + imm, true);
            registerSet.setRegister(rd, half);
            cpu.pc += 4;
        }],
    [0x2, (instruction, cpu) => {
            const { registerSet, ram } = cpu;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);
            const word = ram.getInt32(rs1Value + imm, true);
            registerSet.setRegister(rd, word);
            cpu.pc += 4;
        }],
    [0x4, (instruction, cpu) => {
            const { registerSet, ram } = cpu;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);
            const byte = ram.getUint8(rs1Value + imm);
            registerSet.setRegister(rd, byte);
            cpu.pc += 4;
        }],
    [0x5, (instruction, cpu) => {
            const { registerSet, ram } = cpu;
            const { rd, rs1, imm } = instruction;
            const rs1Value = registerSet.getRegister(rs1);
            const half = ram.getUint16(rs1Value + imm, true);
            registerSet.setRegister(rd, half);
            cpu.pc += 4;
        }],
]);
const opcode0x13func3Table = new Map([
    [0x0, (instruction, cpu) => {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const result = rs1Value + imm;
            registerSet.setRegister(rd, result);
            cpu.pc += 4;
        }],
    [0x1, (instruction, cpu) => {
            const { rd, rs1, shamt } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const result = rs1Value << shamt;
            registerSet.setRegister(rd, result);
            cpu.pc += 4;
        }],
    [0x2, (instruction, cpu) => {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const result = rs1Value < imm ? 1 : 0;
            registerSet.setRegister(rd, result);
            cpu.pc += 4;
        }],
    [0x3, (instruction, cpu) => {
            const { rd, rs1, immU } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegisterU(rs1);
            const result = rs1Value < immU ? 1 : 0;
            registerSet.setRegister(rd, result);
            cpu.pc += 4;
        }],
    [0x4, (instruction, cpu) => {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const result = rs1Value ^ imm;
            registerSet.setRegister(rd, result);
            cpu.pc += 4;
        }],
    [0x5, (instruction, cpu) => {
            const { rd, rs1, imm, func7, shamt } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            if (func7 === 0x00) {
                const result = rs1Value >>> shamt;
                registerSet.setRegister(rd, result);
            }
            else if (func7 === 0x20) {
                const result = rs1Value >> shamt;
                registerSet.setRegister(rd, result);
            }
            cpu.pc += 4;
        }],
    [0x6, (instruction, cpu) => {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const result = rs1Value | imm;
            registerSet.setRegister(rd, result);
            cpu.pc += 4;
        }],
    [0x7, (instruction, cpu) => {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const result = rs1Value & imm;
            registerSet.setRegister(rd, result);
            cpu.pc += 4;
        }],
]);
const opcode0x23func3Table = new Map([
    [0x0, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet, ram } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            const byte = (0, binaryFunctions_1.getRange)(rs2Value, 7, 0);
            ram.setInt8(rs1Value + imm, byte);
        }],
    [0x1, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet, ram } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            const half = (0, binaryFunctions_1.getRange)(rs2Value, 15, 0);
            ram.setInt16(rs1Value + imm, half, true);
        }],
    [0x2, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet, ram } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            ram.setInt32(rs1Value + imm, rs2Value, true);
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
            const rs2Value = registerSet.getRegisterU(rs2);
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
            const { rs1, rs2, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            if (rs1Value === rs2Value) {
                cpu.pc += imm;
            }
            else {
                cpu.pc += 4;
            }
        }],
    [0x1, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            if (rs1Value !== rs2Value) {
                cpu.pc += imm;
            }
            else {
                cpu.pc += 4;
            }
        }],
    [0x4, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            if (rs1Value < rs2Value) {
                cpu.pc += imm;
            }
            else {
                cpu.pc += 4;
            }
        }],
    [0x5, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            const rs2Value = registerSet.getRegister(rs2);
            if (rs1Value >= rs2Value) {
                cpu.pc += imm;
            }
            else {
                cpu.pc += 4;
            }
        }],
    [0x6, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegisterU(rs1);
            const rs2Value = registerSet.getRegisterU(rs2);
            if (rs1Value < rs2Value) {
                cpu.pc += imm;
            }
            else {
                cpu.pc += 4;
            }
        }],
    [0x7, (instruction, cpu) => {
            const { rs1, rs2, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegisterU(rs1);
            const rs2Value = registerSet.getRegisterU(rs2);
            if (rs1Value >= rs2Value) {
                cpu.pc += imm;
            }
            else {
                cpu.pc += 4;
            }
        }],
]);
const opcode0x67func3Table = new Map([
    [0x0, (instruction, cpu) => {
            const { rd, rs1, imm } = instruction;
            const { registerSet } = cpu;
            const rs1Value = registerSet.getRegister(rs1);
            registerSet.setRegister(rd, cpu.pc + 4);
            cpu.pc = rs1Value + imm;
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
            const { rd, imm } = instruction;
            const { registerSet } = cpu;
            registerSet.setRegister(rd, imm);
        }],
    [0x17, (instruction, cpu) => {
            const { rd, imm } = instruction;
            const { registerSet } = cpu;
            registerSet.setRegister(rd, imm + cpu.pc);
        }]
]);
const j_TypeOpcodeTable = new Map([
    [0x6F, (instruction, cpu) => {
            const { rd, imm } = instruction;
            const { registerSet } = cpu;
            registerSet.setRegister(rd, cpu.pc + 4);
            cpu.pc += imm;
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
