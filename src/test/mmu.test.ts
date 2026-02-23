import { CPU } from "../cpu";

// ─── Sv32 constants ──────────────────────────────────────────────────────────

const PAGE = 4096;

// PTE permission/status flags (Sv32 §4.3.1)
const PTE_V = 1 << 0; // Valid
const PTE_R = 1 << 1; // Read
const PTE_W = 1 << 2; // Write
const PTE_X = 1 << 3; // Execute
const PTE_U = 1 << 4; // User-accessible
const PTE_A = 1 << 6; // Accessed
const PTE_D = 1 << 7; // Dirty

function pte(ppn: number, flags: number) {
    return (ppn << 10) | flags;
}

// Privilege levels (RISC-V privileged spec encoding)
const PRIV_USER       = 0;
const PRIV_SUPERVISOR = 1;
const PRIV_MACHINE    = 3;

// CSR addresses
const CSR_SATP    = 0x180;
const CSR_MSTATUS = 0x300;
const CSR_MTVEC   = 0x305;
const CSR_MCAUSE  = 0x342;

// ─── Physical memory layout used by all tests ─────────────────────────────────
//
//  Page 1 (0x1000) : root page table  (ROOT_PPN = 1)
//  Page 2 (0x2000) : leaf page table  (LEAF_PPN = 2)
//  Page 3 (0x3000) : data page        (DATA_PPN = 3)
//
//  Standard virtual address: VPN[1]=0, VPN[0]=1, offset
//    → root[0] → leaf[1] → PA = 0x3000 + offset

const ROOT_PPN = 1;
const LEAF_PPN = 2;
const DATA_PPN = 3;

// SATP: MODE=Sv32 (bit 31), root PPN = 1
const SATP_SV32 = (1 << 31) | ROOT_PPN;

// Build a virtual address from its Sv32 components
function va(vpn1: number, vpn0: number, offset = 0): number {
    return (vpn1 << 22) | (vpn0 << 12) | (offset & 0xFFF);
}

// The standard test virtual address (maps to DATA_PPN page)
const TEST_VA = va(0, 1, 0);
const TEST_PA = DATA_PPN * PAGE; // 0x3000

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCpu(ramPages = 16): { cpu: CPU; mem: DataView } {
    const ram = new ArrayBuffer(ramPages * PAGE);
    const cpu = new CPU(ram, 0);
    return { cpu, mem: new DataView(ram) };
}

// Write the root pointer PTE and the data leaf PTE for the standard mapping.
// leafFlags controls the permissions on the DATA_PPN page (PTE_V is always added).
function writeMapping(mem: DataView, leafFlags: number) {
    // Root entry [0] → leaf table (non-leaf: V=1, no R/W/X)
    mem.setUint32(ROOT_PPN * PAGE + 0 * 4, pte(LEAF_PPN, PTE_V), true);
    // Leaf entry [1] → data page
    mem.setUint32(LEAF_PPN * PAGE + 1 * 4, pte(DATA_PPN, leafFlags | PTE_V), true);
}

// Enable Sv32 paging and switch to the given privilege (0=U, 1=S).
function enablePaging(cpu: CPU, mem: DataView, privilege: number, leafFlags: number) {
    writeMapping(mem, leafFlags);
    cpu.set_csr(CSR_SATP, SATP_SV32);
    (cpu as any).currentPrivilege = privilege;
}

// ─── Machine-mode bypass ─────────────────────────────────────────────────────

describe('Machine mode MMU bypass (Sv32 §4.3.2):', () => {

    test('M-mode returns physical address unchanged when paging is off', () => {
        const { cpu } = makeCpu();
        // CPU defaults to M-mode, SATP=0 (paging off)
        expect(cpu.mmu_translate(0xDEAD1234, 'R')).toBe(0xDEAD1234);
    });

    test('M-mode bypasses MMU even when Sv32 paging is enabled', () => {
        const { cpu, mem } = makeCpu();
        writeMapping(mem, PTE_R | PTE_A);
        cpu.set_csr(CSR_SATP, SATP_SV32);
        // currentPrivilege is still Machine → bypass
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_VA);
    });

    test('M-mode instruction fetch bypasses MMU even with MPRV set', () => {
        // MPRV only affects data (R/W) accesses, not instruction fetch (X)
        const { cpu, mem } = makeCpu();
        writeMapping(mem, PTE_X | PTE_A);
        cpu.set_csr(CSR_SATP, SATP_SV32);
        // MPRV=1, MPP=User
        cpu.set_csr(CSR_MSTATUS, (1 << 17) | (PRIV_USER << 11));
        expect(cpu.mmu_translate(TEST_VA, 'X')).toBe(TEST_VA);
    });

    test('M-mode with MPRV=1 translates data accesses using MPP privilege', () => {
        // With MPRV=1 and MPP=User, a User-accessible page should translate
        const { cpu, mem } = makeCpu();
        // U=1 so User mode can access
        enablePaging(cpu, mem, PRIV_MACHINE, PTE_R | PTE_U | PTE_A);
        // MPRV=1, MPP=User (bits 17 and 12:11)
        cpu.set_csr(CSR_MSTATUS, (1 << 17) | (PRIV_USER << 11));
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_PA);
    });

    test('M-mode with MPRV=1 and MPP=Supervisor faults on User page (U=1, SUM=0)', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_MACHINE, PTE_R | PTE_U | PTE_A);
        // MPRV=1, MPP=Supervisor, SUM=0
        cpu.set_csr(CSR_MSTATUS, (1 << 17) | (PRIV_SUPERVISOR << 11));
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

});

// ─── Paging disabled (non-M mode) ────────────────────────────────────────────

describe('Paging disabled in non-M mode (Sv32 §4.3.2):', () => {

    test('User mode with SATP.MODE=0 returns physical address unchanged', () => {
        const { cpu } = makeCpu();
        (cpu as any).currentPrivilege = PRIV_USER;
        // SATP mode bits = 0 → no translation
        cpu.set_csr(CSR_SATP, 0);
        expect(cpu.mmu_translate(0x12345678, 'R')).toBe(0x12345678);
    });

    test('Supervisor mode with SATP.MODE=0 returns physical address unchanged', () => {
        const { cpu } = makeCpu();
        (cpu as any).currentPrivilege = PRIV_SUPERVISOR;
        cpu.set_csr(CSR_SATP, 0);
        expect(cpu.mmu_translate(0x12345678, 'W')).toBe(0x12345678);
    });

});

// ─── Two-level page walk (4KB pages) ─────────────────────────────────────────

describe('Two-level page walk (Sv32 §4.3.2, 4KB pages):', () => {

    test('translates virtual address to correct physical address', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U | PTE_A);
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_PA);
    });

    test('page-offset bits [11:0] are preserved in the physical address', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U | PTE_A);
        const offset = 0xABC;
        expect(cpu.mmu_translate(va(0, 1, offset), 'R')).toBe(TEST_PA + offset);
    });

    test('different VPN[0] indices map to different physical pages', () => {
        const { cpu, mem } = makeCpu();
        writeMapping(mem, PTE_R | PTE_U | PTE_A);
        // Add a second leaf entry [2] → DATA_PPN + 1
        mem.setUint32(LEAF_PPN * PAGE + 2 * 4, pte(DATA_PPN + 1, PTE_R | PTE_U | PTE_A | PTE_V), true);
        cpu.set_csr(CSR_SATP, SATP_SV32);
        (cpu as any).currentPrivilege = PRIV_USER;

        expect(cpu.mmu_translate(va(0, 1, 0), 'R')).toBe(DATA_PPN * PAGE);
        expect(cpu.mmu_translate(va(0, 2, 0), 'R')).toBe((DATA_PPN + 1) * PAGE);
    });

});

// ─── Invalid PTEs ─────────────────────────────────────────────────────────────

describe('Invalid PTEs cause page faults (Sv32 §4.3.2, step 3):', () => {

    test('V=0 in level-1 (root) PTE causes page fault', () => {
        const { cpu, mem } = makeCpu();
        // Write a root entry with V=0
        mem.setUint32(ROOT_PPN * PAGE + 0 * 4, pte(LEAF_PPN, 0), true); // V=0
        cpu.set_csr(CSR_SATP, SATP_SV32);
        (cpu as any).currentPrivilege = PRIV_USER;
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

    test('V=0 in level-0 (leaf) PTE causes page fault', () => {
        const { cpu, mem } = makeCpu();
        mem.setUint32(ROOT_PPN * PAGE + 0 * 4, pte(LEAF_PPN, PTE_V), true);
        mem.setUint32(LEAF_PPN * PAGE + 1 * 4, pte(DATA_PPN, 0), true); // V=0
        cpu.set_csr(CSR_SATP, SATP_SV32);
        (cpu as any).currentPrivilege = PRIV_USER;
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

    test('level-0 PTE with V=1 but R=W=X=0 (non-leaf at last level) causes page fault', () => {
        // A pointer PTE at the leaf level is illegal per §4.3.2 step 5
        const { cpu, mem } = makeCpu();
        mem.setUint32(ROOT_PPN * PAGE + 0 * 4, pte(LEAF_PPN, PTE_V), true);
        mem.setUint32(LEAF_PPN * PAGE + 1 * 4, pte(DATA_PPN, PTE_V), true); // no R/W/X
        cpu.set_csr(CSR_SATP, SATP_SV32);
        (cpu as any).currentPrivilege = PRIV_USER;
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

});

// ─── Permission bits ──────────────────────────────────────────────────────────

describe('Permission bit checks (Sv32 §4.3.2, step 6):', () => {

    test('read succeeds on a readable page (R=1)', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U | PTE_A);
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_PA);
    });

    test('read on a non-readable page (R=0) causes a page fault', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_X | PTE_U | PTE_A); // execute-only
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

    test('write succeeds on a writable page (W=1)', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_W | PTE_U | PTE_A | PTE_D);
        expect(cpu.mmu_translate(TEST_VA, 'W')).toBe(TEST_PA);
    });

    test('write on a non-writable page (W=0) causes a page fault', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U | PTE_A); // read-only
        expect(() => cpu.mmu_translate(TEST_VA, 'W')).toThrow();
    });

    test('execute succeeds on an executable page (X=1)', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_X | PTE_U | PTE_A);
        expect(cpu.mmu_translate(TEST_VA, 'X')).toBe(TEST_PA);
    });

    test('execute on a non-executable page (X=0) causes a page fault', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U | PTE_A); // read-only
        expect(() => cpu.mmu_translate(TEST_VA, 'X')).toThrow();
    });

});

// ─── Privilege / U-bit checks ─────────────────────────────────────────────────

describe('Privilege and U-bit checks (Sv32 §4.3.2, step 6):', () => {

    test('User mode can access a User page (U=1)', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U | PTE_A);
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_PA);
    });

    test('User mode accessing a Supervisor page (U=0) causes a page fault', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_A); // U=0
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

    test('Supervisor mode can access a Supervisor page (U=0)', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_SUPERVISOR, PTE_R | PTE_A); // U=0
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_PA);
    });

    test('Supervisor mode accessing a User page (U=1) without SUM causes a page fault', () => {
        // mstatus.SUM = 0 (default) → Supervisor cannot access U=1 pages
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_SUPERVISOR, PTE_R | PTE_U | PTE_A);
        cpu.set_csr(CSR_MSTATUS, 0); // SUM=0
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

    test('Supervisor mode can access a User page (U=1) when mstatus.SUM=1', () => {
        // mstatus.SUM (bit 18) = 1 → Supervisor may access U=1 pages
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_SUPERVISOR, PTE_R | PTE_U | PTE_A);
        cpu.set_csr(CSR_MSTATUS, 1 << 18); // SUM=1
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_PA);
    });

});

// ─── Accessed and Dirty bits ──────────────────────────────────────────────────

describe('Accessed (A) and Dirty (D) bit checks (Sv32 §4.3.2, step 7):', () => {

    test('any access to a page with A=0 causes a fault', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U); // A=0
        expect(() => cpu.mmu_translate(TEST_VA, 'R')).toThrow();
    });

    test('read on a page with A=1, D=0 succeeds', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_U | PTE_A); // D=0
        expect(cpu.mmu_translate(TEST_VA, 'R')).toBe(TEST_PA);
    });

    test('write to a page with A=1, D=0 causes a fault', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_W | PTE_U | PTE_A); // D=0
        expect(() => cpu.mmu_translate(TEST_VA, 'W')).toThrow();
    });

    test('write to a page with A=1, D=1 succeeds', () => {
        const { cpu, mem } = makeCpu();
        enablePaging(cpu, mem, PRIV_USER, PTE_R | PTE_W | PTE_U | PTE_A | PTE_D);
        expect(cpu.mmu_translate(TEST_VA, 'W')).toBe(TEST_PA);
    });

});

// ─── Megapage (4MB superpage) ─────────────────────────────────────────────────
//
//  A level-1 PTE with R, W, or X set is a superpage leaf.
//  For Sv32 the superpage covers 4MB (VPN[0] and page offset form the low 22 bits).
//  PPN[0] of the superpage PTE must be zero (alignment); otherwise it is a fault.

describe('Megapage (4MB superpage) translation (Sv32 §4.3.2, superpage):', () => {

    // Megapage physical base: PPN must have PPN[0]=0 (4MB aligned).
    // PPN = 0x400 → physical base = 0x400000; PPN[0] = 0x400 & 0x3FF = 0 ✓
    const MEGA_PPN   = 0x400;
    const MEGA_PHYS  = MEGA_PPN * PAGE; // 0x400000
    const MEGA_PAGES = MEGA_PHYS / PAGE + 4; // need RAM up to megapage + a bit

    function setupMegapage(leafFlags: number): { cpu: CPU; mem: DataView } {
        const { cpu, mem } = makeCpu(MEGA_PAGES);
        // Root entry [1] is itself a leaf (has X/R/W → superpage)
        mem.setUint32(ROOT_PPN * PAGE + 1 * 4, pte(MEGA_PPN, leafFlags | PTE_V), true);
        cpu.set_csr(CSR_SATP, SATP_SV32);
        (cpu as any).currentPrivilege = PRIV_USER;
        return { cpu, mem };
    }

    test('translates a megapage-aligned virtual address to the correct physical address', () => {
        const { cpu } = setupMegapage(PTE_R | PTE_U | PTE_A);
        // VA 0x00400000: VPN[1]=1, VPN[0]=0, offset=0
        const megaVA = va(1, 0, 0);
        expect(cpu.mmu_translate(megaVA, 'R')).toBe(MEGA_PHYS);
    });

    test('page offset and VPN[0] are used as the low 22 bits of the physical address', () => {
        const { cpu } = setupMegapage(PTE_R | PTE_U | PTE_A);
        // VA with VPN[0]=5, offset=0xABC → physical = MEGA_PHYS | (5 << 12) | 0xABC
        const megaVA = va(1, 5, 0xABC);
        const expectedPA = MEGA_PHYS | (5 << 12) | 0xABC;
        expect(cpu.mmu_translate(megaVA, 'R')).toBe(expectedPA);
    });

    test('misaligned superpage (PPN[0] ≠ 0) causes a page fault', () => {
        // Sv32 §4.3.2 step 5: if i > 0 and pte.ppn[i−1:0] ≠ 0 → fault
        const { cpu, mem } = makeCpu(MEGA_PAGES);
        // PPN = 0x401 → PPN[0] = 0x401 & 0x3FF = 1 (misaligned)
        mem.setUint32(ROOT_PPN * PAGE + 1 * 4, pte(0x401, PTE_R | PTE_U | PTE_A | PTE_V), true);
        cpu.set_csr(CSR_SATP, SATP_SV32);
        (cpu as any).currentPrivilege = PRIV_USER;
        expect(() => cpu.mmu_translate(va(1, 0, 0), 'R')).toThrow();
    });

});
