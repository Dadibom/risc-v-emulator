"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assembler = void 0;
const instruction_1 = require("./instruction");
class Assembler {
    // Convert a a set of assembly instructions to machine code
    static assemble(asm) {
        //const parsedAssembly = parse(asm);
        // TODO: link symbols, labels, sections, files etc.
        const parsedAssembly = asm;
        const binaryBuffer = new ArrayBuffer(parsedAssembly.length * 4);
        const binView = new DataView(binaryBuffer);
        parsedAssembly.forEach((line, index) => {
            const machineCode = this.assembleLine(line);
            binView.setInt32(index * 4, machineCode.binary, true);
        });
        return binaryBuffer;
    }
    // Convert a single assembly instruction to machine code
    static assembleLine(asm) {
        const tokens = asm.toLowerCase()
            .replace(/,/g, '')
            .replace(/\(|\)/g, ' ')
            .split(' ');
        const baseValues = instructionTable.get(tokens[0]);
        if (baseValues === undefined) {
            throw new Error(`Instruction not found in instruction table; instruction provided: ${tokens[0]}`);
        }
        let instruction;
        switch (baseValues.type) {
            case instruction_1.InstructionType.R:
                instruction = new instruction_1.R_Type(Object.assign(Object.assign({}, baseValues), { rd: parseRegister(tokens[1]), rs1: parseRegister(tokens[2]), rs2: parseRegister(tokens[3]) }));
                break;
            case instruction_1.InstructionType.I:
                switch (i_Subtypes.get(tokens[0])) {
                    case ImmediateSubtypes.Normal:
                        instruction = new instruction_1.I_Type(Object.assign(Object.assign({}, baseValues), { rd: parseRegister(tokens[1]), rs1: parseRegister(tokens[2]), imm: parseInt(tokens[3]) }));
                        break;
                    case ImmediateSubtypes.Indexed:
                        instruction = new instruction_1.I_Type(Object.assign(Object.assign({}, baseValues), { rd: parseRegister(tokens[1]), imm: parseInt(tokens[2]), rs1: parseRegister(tokens[3]) }));
                        break;
                    case ImmediateSubtypes.Shamt:
                        instruction = new instruction_1.I_Type(Object.assign(Object.assign({}, baseValues), { rd: parseRegister(tokens[1]), rs1: parseRegister(tokens[2]), shamt: parseInt(tokens[3]) }));
                        break;
                    case ImmediateSubtypes.Ecall:
                        instruction = new instruction_1.I_Type(Object.assign({}, baseValues));
                        break;
                }
                break;
            case instruction_1.InstructionType.S:
                instruction = new instruction_1.S_Type(Object.assign(Object.assign({}, baseValues), { rs2: parseRegister(tokens[1]), imm: parseInt(tokens[2]), rs1: parseRegister(tokens[3]) }));
                break;
            case instruction_1.InstructionType.B:
                instruction = new instruction_1.B_Type(Object.assign(Object.assign({}, baseValues), { rs1: parseRegister(tokens[1]), rs2: parseRegister(tokens[2]), imm: parseInt(tokens[3]) }));
                break;
            case instruction_1.InstructionType.U:
                instruction = new instruction_1.U_Type(Object.assign(Object.assign({}, baseValues), { rd: parseRegister(tokens[1]), imm: parseInt(tokens[2]) }));
                break;
            case instruction_1.InstructionType.J:
                instruction = new instruction_1.J_Type(Object.assign(Object.assign({}, baseValues), { rd: parseRegister(tokens[1]), imm: parseInt(tokens[2]) }));
                break;
        }
        return instruction;
    }
}
exports.Assembler = Assembler;
/*
=====================================================
===============   Register Aliases:   ===============
=====================================================

x0          zero           Hard-wired zero
x1          ra             Return address
x2          sp             Stack Pointer
x3          gp             Global Pointer
x4          tp             Thread Pointer
x5          t0             Temporary register/Alternative link
x6-7        t1-2           Temporary registers
x8          s0/fp          Saved Register/Frame pointer
x9          s1             Saved Register
x10-11      a0-1           Function Arguments/Return value
x12-17      a2-7           Function Arguments
x18-27      s2-11          Saved Registers
x28-31      t3-6           Temporaries

Source: Page 137 of Volume I: RISC-V Unprivileged ISA V20191213

*/
function parseRegister(registerName) {
    const registerIndex = registerTable.get(registerName);
    if (registerIndex === undefined) {
        throw new Error(`Register name not found in register table; Name provided: ${registerName}`);
    }
    return registerIndex;
}
const registerTable = new Map([
    ['x0', 0],
    ['x1', 1],
    ['x2', 2],
    ['x3', 3],
    ['x4', 4],
    ['x5', 5],
    ['x6', 6],
    ['x7', 7],
    ['x8', 8],
    ['x9', 9],
    ['x10', 10],
    ['x11', 11],
    ['x12', 12],
    ['x13', 13],
    ['x14', 14],
    ['x15', 15],
    ['x16', 16],
    ['x17', 17],
    ['x18', 18],
    ['x19', 19],
    ['x20', 20],
    ['x21', 21],
    ['x22', 22],
    ['x23', 23],
    ['x24', 24],
    ['x25', 25],
    ['x26', 26],
    ['x27', 27],
    ['x28', 28],
    ['x29', 29],
    ['x30', 30],
    ['x31', 31],
    ['zero', 0],
    ['ra', 1],
    ['sp', 2],
    ['gp', 3],
    ['tp', 4],
    ['t0', 5],
    ['t1', 6],
    ['t2', 7],
    ['s0', 8],
    ['fp', 8],
    ['s1', 9],
    ['a0', 10],
    ['a1', 11],
    ['a2', 12],
    ['a3', 13],
    ['a4', 14],
    ['a5', 15],
    ['a6', 16],
    ['a7', 17],
    ['s2', 18],
    ['s3', 19],
    ['s4', 20],
    ['s5', 21],
    ['s6', 22],
    ['s7', 23],
    ['s8', 24],
    ['s9', 25],
    ['s10', 26],
    ['s11', 27],
    ['t3', 28],
    ['t4', 29],
    ['t5', 30],
    ['t6', 31],
]);
const instructionTable = new Map([
    ['lui', { type: instruction_1.InstructionType.U, opcode: 0x37 }],
    ['auipc', { type: instruction_1.InstructionType.U, opcode: 0x17 }],
    ['jal', { type: instruction_1.InstructionType.J, opcode: 0x6F }],
    ['jalr', { type: instruction_1.InstructionType.I, opcode: 0x67, func3: 0x0 }],
    ['beq', { type: instruction_1.InstructionType.B, opcode: 0x63, func3: 0x0 }],
    ['bne', { type: instruction_1.InstructionType.B, opcode: 0x63, func3: 0x1 }],
    ['blt', { type: instruction_1.InstructionType.B, opcode: 0x63, func3: 0x4 }],
    ['bge', { type: instruction_1.InstructionType.B, opcode: 0x63, func3: 0x5 }],
    ['bltu', { type: instruction_1.InstructionType.B, opcode: 0x63, func3: 0x6 }],
    ['bgeu', { type: instruction_1.InstructionType.B, opcode: 0x63, func3: 0x7 }],
    ['lb', { type: instruction_1.InstructionType.I, opcode: 0x03, func3: 0x0 }],
    ['lh', { type: instruction_1.InstructionType.I, opcode: 0x03, func3: 0x1 }],
    ['lw', { type: instruction_1.InstructionType.I, opcode: 0x03, func3: 0x2 }],
    ['lbu', { type: instruction_1.InstructionType.I, opcode: 0x03, func3: 0x4 }],
    ['lhu', { type: instruction_1.InstructionType.I, opcode: 0x03, func3: 0x5 }],
    ['sb', { type: instruction_1.InstructionType.S, opcode: 0x23, func3: 0x0 }],
    ['sh', { type: instruction_1.InstructionType.S, opcode: 0x23, func3: 0x1 }],
    ['sw', { type: instruction_1.InstructionType.S, opcode: 0x23, func3: 0x2 }],
    ['addi', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x0 }],
    ['slti', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x2 }],
    ['sltiu', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x3 }],
    ['xori', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x4 }],
    ['ori', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x6 }],
    ['andi', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x7 }],
    ['slli', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x1, func7: 0x00 }],
    ['srli', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x5, func7: 0x00 }],
    ['srai', { type: instruction_1.InstructionType.I, opcode: 0x13, func3: 0x5, func7: 0x20 }],
    ['add', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x0, func7: 0x00 }],
    ['sub', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x0, func7: 0x20 }],
    ['sll', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x1, func7: 0x00 }],
    ['slt', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x2, func7: 0x00 }],
    ['sltu', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x3, func7: 0x00 }],
    ['xor', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x4, func7: 0x00 }],
    ['srl', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x5, func7: 0x00 }],
    ['sra', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x5, func7: 0x20 }],
    ['or', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x6, func7: 0x00 }],
    ['and', { type: instruction_1.InstructionType.R, opcode: 0x33, func3: 0x7, func7: 0x00 }],
    ['ecall', { type: instruction_1.InstructionType.I, opcode: 0x73, func3: 0x0, func7: 0x00 }],
]);
var ImmediateSubtypes;
(function (ImmediateSubtypes) {
    ImmediateSubtypes[ImmediateSubtypes["Normal"] = 0] = "Normal";
    ImmediateSubtypes[ImmediateSubtypes["Shamt"] = 1] = "Shamt";
    ImmediateSubtypes[ImmediateSubtypes["Indexed"] = 2] = "Indexed";
    ImmediateSubtypes[ImmediateSubtypes["Ecall"] = 3] = "Ecall";
})(ImmediateSubtypes || (ImmediateSubtypes = {}));
const i_Subtypes = new Map([
    ['jalr', ImmediateSubtypes.Indexed],
    ['lb', ImmediateSubtypes.Indexed],
    ['lh', ImmediateSubtypes.Indexed],
    ['lw', ImmediateSubtypes.Indexed],
    ['lbu', ImmediateSubtypes.Indexed],
    ['lhu', ImmediateSubtypes.Indexed],
    ['addi', ImmediateSubtypes.Normal],
    ['slti', ImmediateSubtypes.Normal],
    ['sltiu', ImmediateSubtypes.Normal],
    ['xori', ImmediateSubtypes.Normal],
    ['ori', ImmediateSubtypes.Normal],
    ['andi', ImmediateSubtypes.Normal],
    ['slli', ImmediateSubtypes.Shamt],
    ['srli', ImmediateSubtypes.Shamt],
    ['srai', ImmediateSubtypes.Shamt],
    ['ecall', ImmediateSubtypes.Ecall],
]);
