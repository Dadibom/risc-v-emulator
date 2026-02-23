"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cpu_1 = require("../cpu");
const gnuAssembler_1 = require("./gnuAssembler");
const { assembleLine } = gnuAssembler_1.GnuAssembler;
// CSR addresses
const MSTATUS = 0x300;
const MTVEC = 0x305;
const MSCRATCH = 0x340;
const MEPC = 0x341;
const MCAUSE = 0x342;
const MTVAL = 0x343;
function makeCpu() {
    return new cpu_1.CPU(new ArrayBuffer(0), 0);
}
// ─── CSRRW ───────────────────────────────────────────────────────────────────
describe('CSRRW (CSR read/write):', () => {
    test('writes rs1 to CSR and reads old CSR value into rd', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0x11111111);
        cpu.registerSet.setRegister(1, 0x22222222);
        cpu.executeInstruction(assembleLine('csrrw x2, mscratch, x1').binary);
        expect(cpu.get_csr(MSCRATCH)).toBe(0x22222222);
        expect(cpu.registerSet.getRegister(2)).toBe(0x11111111);
    });
    test('with rd=x0, still writes to CSR but skips the read', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0x11111111);
        cpu.registerSet.setRegister(1, 0x22222222);
        cpu.executeInstruction(assembleLine('csrrw x0, mscratch, x1').binary);
        expect(cpu.get_csr(MSCRATCH)).toBe(0x22222222);
        expect(cpu.registerSet.getRegister(0)).toBe(0); // x0 hardwired to zero
    });
    test('advances pc by 4 on success', () => {
        const cpu = makeCpu();
        cpu.executeInstruction(assembleLine('csrrw x0, mscratch, x0').binary);
        expect(cpu.pc).toBe(4);
    });
});
// ─── CSRRS ───────────────────────────────────────────────────────────────────
describe('CSRRS (CSR read and set bits):', () => {
    test('reads old CSR value into rd, then ORs CSR with rs1', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0b1010);
        cpu.registerSet.setRegister(1, 0b0101);
        cpu.executeInstruction(assembleLine('csrrs x2, mscratch, x1').binary);
        expect(cpu.registerSet.getRegister(2)).toBe(0b1010); // old value
        expect(cpu.get_csr(MSCRATCH)).toBe(0b1111); // bits OR'd in
    });
    test('with rs1=x0, is a pure read with no write side-effect', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0x12345678);
        cpu.executeInstruction(assembleLine('csrrs x1, mscratch, x0').binary);
        expect(cpu.registerSet.getRegister(1)).toBe(0x12345678);
        expect(cpu.get_csr(MSCRATCH)).toBe(0x12345678); // unchanged
    });
});
// ─── CSRRC ───────────────────────────────────────────────────────────────────
describe('CSRRC (CSR read and clear bits):', () => {
    test('reads old CSR value into rd, then clears bits set in rs1', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0b1111);
        cpu.registerSet.setRegister(1, 0b0101);
        cpu.executeInstruction(assembleLine('csrrc x2, mscratch, x1').binary);
        expect(cpu.registerSet.getRegister(2)).toBe(0b1111); // old value
        expect(cpu.get_csr(MSCRATCH)).toBe(0b1010); // bits cleared
    });
    test('with rs1=x0, is a pure read with no write side-effect', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0x12345678);
        cpu.executeInstruction(assembleLine('csrrc x1, mscratch, x0').binary);
        expect(cpu.registerSet.getRegister(1)).toBe(0x12345678);
        expect(cpu.get_csr(MSCRATCH)).toBe(0x12345678); // unchanged
    });
});
// ─── CSRRWI ──────────────────────────────────────────────────────────────────
describe('CSRRWI (CSR read/write immediate):', () => {
    test('writes 5-bit zero-extended immediate to CSR, reads old value into rd', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0x99999999);
        cpu.executeInstruction(assembleLine('csrrwi x1, mscratch, 15').binary);
        expect(cpu.registerSet.getRegister(1)).toBe(0x99999999 | 0); // old (signed)
        expect(cpu.get_csr(MSCRATCH)).toBe(15);
    });
    test('immediate 0 writes zero to CSR', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0xABCDEF01);
        cpu.executeInstruction(assembleLine('csrrwi x1, mscratch, 0').binary);
        expect(cpu.get_csr(MSCRATCH)).toBe(0);
    });
    test('maximum 5-bit immediate (31) is written correctly', () => {
        const cpu = makeCpu();
        cpu.executeInstruction(assembleLine('csrrwi x0, mscratch, 31').binary);
        expect(cpu.get_csr(MSCRATCH)).toBe(31);
    });
});
// ─── CSRRSI ──────────────────────────────────────────────────────────────────
describe('CSRRSI (CSR read and set bits immediate):', () => {
    test('reads old CSR into rd, then ORs CSR with 5-bit immediate', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0b1010);
        cpu.executeInstruction(assembleLine('csrrsi x1, mscratch, 5').binary);
        expect(cpu.registerSet.getRegister(1)).toBe(0b1010); // old value
        expect(cpu.get_csr(MSCRATCH)).toBe(0b1111); // 0b1010 | 0b0101
    });
});
// ─── CSRRCI ──────────────────────────────────────────────────────────────────
describe('CSRRCI (CSR read and clear bits immediate):', () => {
    test('reads old CSR into rd, then clears bits set in 5-bit immediate', () => {
        const cpu = makeCpu();
        cpu.set_csr(MSCRATCH, 0b1111);
        cpu.executeInstruction(assembleLine('csrrci x1, mscratch, 5').binary);
        expect(cpu.registerSet.getRegister(1)).toBe(0b1111); // old value
        expect(cpu.get_csr(MSCRATCH)).toBe(0b1010); // 0b1111 & ~0b0101
    });
});
// ─── Read-only CSR protection ─────────────────────────────────────────────────
describe('Read-only CSR protection:', () => {
    // CSRs with bits [11:10] = 0b11 are read-only (e.g. cycle=0xC00)
    test('CSRRW to a read-only CSR triggers an illegal instruction trap', () => {
        const cpu = makeCpu();
        cpu.set_csr(MTVEC, 0x2000);
        cpu.executeInstruction(assembleLine('csrrw x1, cycle, x0').binary);
        expect(cpu.get_csr(MCAUSE)).toBe(2); // illegal instruction
        expect(cpu.pc).toBe(0x2000);
    });
    test('CSRRS with rs1=x0 on a read-only CSR is allowed (pure read)', () => {
        const cpu = makeCpu();
        cpu.set_csr(MTVEC, 0x2000);
        cpu.executeInstruction(assembleLine('csrrs x1, cycle, x0').binary);
        expect(cpu.get_csr(MCAUSE)).toBe(0); // no trap
        expect(cpu.pc).toBe(4); // normal advancement
    });
    test('CSRRC with rs1=x0 on a read-only CSR is allowed (pure read)', () => {
        const cpu = makeCpu();
        cpu.set_csr(MTVEC, 0x2000);
        cpu.executeInstruction(assembleLine('csrrc x1, cycle, x0').binary);
        expect(cpu.get_csr(MCAUSE)).toBe(0); // no trap
        expect(cpu.pc).toBe(4);
    });
    test('CSRRS with non-zero rs1 on a read-only CSR traps', () => {
        const cpu = makeCpu();
        cpu.set_csr(MTVEC, 0x2000);
        cpu.registerSet.setRegister(1, 1);
        cpu.executeInstruction(assembleLine('csrrs x2, cycle, x1').binary);
        expect(cpu.get_csr(MCAUSE)).toBe(2);
        expect(cpu.pc).toBe(0x2000);
    });
});
// ─── Trap mechanism (ECALL / EBREAK) ─────────────────────────────────────────
describe('ECALL:', () => {
    test('in Machine mode traps with mcause=11 and jumps to mtvec', () => {
        const cpu = makeCpu();
        cpu.set_csr(MTVEC, 0x1000);
        cpu.executeInstruction(assembleLine('ecall').binary);
        expect(cpu.get_csr(MCAUSE)).toBe(11); // environment call from M-mode
        expect(cpu.get_csr(MEPC)).toBe(0); // PC of the faulting instruction
        expect(cpu.pc).toBe(0x1000);
    });
});
describe('EBREAK:', () => {
    test('traps with mcause=3 (breakpoint) and jumps to mtvec', () => {
        const cpu = makeCpu();
        cpu.set_csr(MTVEC, 0x1000);
        cpu.executeInstruction(assembleLine('ebreak').binary);
        expect(cpu.get_csr(MCAUSE)).toBe(3);
        expect(cpu.get_csr(MEPC)).toBe(0);
        expect(cpu.pc).toBe(0x1000);
    });
});
// ─── MRET ─────────────────────────────────────────────────────────────────────
describe('MRET (return from machine-mode trap):', () => {
    test('restores PC to mepc+4', () => {
        const cpu = makeCpu();
        cpu.set_csr(MEPC, 0x500);
        cpu.executeInstruction(assembleLine('mret').binary);
        expect(cpu.pc).toBe(0x504);
    });
    test('trap followed by MRET restores execution context', () => {
        const cpu = makeCpu();
        // Set up a trap vector at 0x1000 and a return address at 0x200
        cpu.set_csr(MTVEC, 0x1000);
        cpu.pc = 0x200;
        cpu.executeInstruction(assembleLine('ecall').binary);
        // Now at trap handler; mepc should be the ecall's PC
        expect(cpu.get_csr(MEPC)).toBe(0x200);
        expect(cpu.pc).toBe(0x1000);
        cpu.executeInstruction(assembleLine('mret').binary);
        // Should resume after the ecall (mepc + 4)
        expect(cpu.pc).toBe(0x204);
    });
    test('mstatus MIE/MPIE are swapped correctly on trap and MRET', () => {
        const cpu = makeCpu();
        cpu.set_csr(MTVEC, 0x1000);
        // Set MIE bit (bit 3) in mstatus
        cpu.set_csr(MSTATUS, 1 << 3);
        cpu.executeInstruction(assembleLine('ecall').binary);
        const mstatusAfterTrap = cpu.get_csr(MSTATUS);
        expect((mstatusAfterTrap >> 3) & 1).toBe(0); // MIE cleared
        expect((mstatusAfterTrap >> 7) & 1).toBe(1); // MPIE = old MIE
        cpu.executeInstruction(assembleLine('mret').binary);
        const mstatusAfterMret = cpu.get_csr(MSTATUS);
        expect((mstatusAfterMret >> 3) & 1).toBe(1); // MIE restored from MPIE
        expect((mstatusAfterMret >> 7) & 1).toBe(1); // MPIE set to 1
    });
});
