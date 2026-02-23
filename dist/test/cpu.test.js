"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assembler_1 = require("../Assembler/assembler");
const cpu_1 = require("../cpu");
describe('Testing RegisterSet class:', () => {
    test('Set x1 to 5', () => {
        const registerSet = new cpu_1.RegisterSet(32);
        registerSet.setRegister(1, 5);
        expect(registerSet.getRegister(1)).toBe(5);
    });
});
describe('Testing R-Type instruction execution:', () => {
    test('Add 3 + 5, place the result in x3', () => {
        const cpu = new cpu_1.CPU(new ArrayBuffer(0), 0);
        cpu.registerSet.setRegister(1, 3);
        cpu.registerSet.setRegister(2, 5);
        expect(cpu.registerSet.getRegister(1)).toBe(3);
        expect(cpu.registerSet.getRegister(2)).toBe(5);
        const addInstruction = assembler_1.Assembler.assembleLine('add x3, x1, x2');
        cpu.executeInstruction(addInstruction.binary);
        expect(cpu.registerSet.getRegister(3)).toBe(8);
    });
});
describe('Testing basic toy programs:', () => {
    test('Simple add, branch, and srl instructions', () => {
        const program = [
            'add tp, ra, sp',
            'beq tp, zero, 0xC',
            'blt tp, ra, 12',
            'add gp, gp, sp',
            'add gp, gp, sp',
            'srl gp, gp, ra',
            'add zero, zero, x1',
            'add zero, zero, x1',
        ];
        const bin = assembler_1.Assembler.assemble(program);
        const cpu = new cpu_1.CPU(bin, 0);
        cpu.registerSet.setRegister(1, 5);
        cpu.registerSet.setRegister(2, -8);
        cpu.registerSet.setRegister(3, 64);
        for (let i = 0; i < 6; i++) {
            cpu.executionStep();
        }
        expect(cpu.registerSet.getRegister(3)).toBe(2);
        expect(cpu.registerSet.getRegister(0)).toBe(0);
    });
});
describe('Control-flow regression cases:', () => {
    test('jalr clears bit 0 of the target address', () => {
        const cpu = new cpu_1.CPU(new ArrayBuffer(0), 0x200);
        cpu.registerSet.setRegister(1, 0x11f65);
        cpu.executeInstruction(assembler_1.Assembler.assembleLine('jalr x0, 0(x1)').binary);
        // RISC-V spec: JALR target is (rs1 + imm) with bit 0 forced to zero.
        expect(cpu.pc).toBe(0x11f64);
    });
    test('jalr applies signed immediate before jumping', () => {
        const cpu = new cpu_1.CPU(new ArrayBuffer(0), 0x200);
        cpu.registerSet.setRegister(1, 0x12000);
        cpu.executeInstruction(assembler_1.Assembler.assembleLine('jalr x0, -8(x1)').binary);
        expect(cpu.pc).toBe(0x11ff8);
    });
    test('beq uses a signed branch immediate for backward branches', () => {
        const cpu = new cpu_1.CPU(new ArrayBuffer(0), 0x1000);
        cpu.executeInstruction(assembler_1.Assembler.assembleLine('beq x0, x0, -4').binary);
        expect(cpu.pc).toBe(0x0ffc);
    });
    test('jal uses a signed immediate for backward jumps', () => {
        const cpu = new cpu_1.CPU(new ArrayBuffer(0), 0x1000);
        cpu.executeInstruction(assembler_1.Assembler.assembleLine('jal x0, -16').binary);
        expect(cpu.pc).toBe(0x0ff0);
    });
});
