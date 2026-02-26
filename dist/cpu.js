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
const CSR_MSTATUS = 0x300;
const CSR_MISA = 0x301;
const CSR_MEDELEG = 0x302;
const CSR_MIDELEG = 0x303;
const CSR_MIE = 0x304;
const CSR_MTVEC = 0x305;
const CSR_STVEC = 0x105;
const CSR_MSCRATCH = 0x340;
const CSR_SSCRATCH = 0x140;
const CSR_SEPC = 0x141;
const CSR_SCAUSE = 0x142;
const CSR_STVAL = 0x143;
const CSR_MEPC = 0x341;
const CSR_MCAUSE = 0x342;
const CSR_MTVAL = 0x343;
const CSR_MIP = 0x344;
const CSR_SATP = 0x180;
const CSR_CYCLE = 0xC00;
const CSR_CYCLEH = 0xC80;
const CSR_MSTATUS_MPIE = 7;
const CSR_MSTATUS_SPIE = 5;
const CSR_MSTATUS_MIE = 3;
const CSR_MSTATUS_SIE = 1;
const CSR_MSTATUS_SPP = 8;
var Privilege;
(function (Privilege) {
    Privilege[Privilege["User"] = 0] = "User";
    Privilege[Privilege["Supervisor"] = 1] = "Supervisor";
    // 0b10 is reserved
    Privilege[Privilege["Machine"] = 3] = "Machine";
})(Privilege || (Privilege = {}));
class CPU {
    constructor(ram, pc, extensions) {
        this.pc = pc;
        this.registerSet = new RegisterSet(32);
        this.csr = new Uint32Array(4096);
        this.currentPrivilege = Privilege.Machine;
        this.mmu_cache = new Map();
        this.cycle_count = 0;
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
        const address = this.mmu_translate(this.pc, 'X');
        const instruction = this.ram.getInt32(address, true);
        this.executeInstruction(instruction);
        ++this.cycle_count;
    }
    executeInstruction(instruction) {
        const opcode = instruction & 0x7F;
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
    executeR_Type33(instruction) {
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
        const { registerSet } = this;
        switch (func3) {
            case 0x0: {
                const rs1Value = registerSet.getRegister(rs1);
                const address = this.mmu_translate(rs1Value + imm, 'R');
                const byte = this.ram.getInt8(address);
                registerSet.setRegister(rd, byte);
                this.pc += 4;
                break;
            }
            case 0x1: {
                const rs1Value = registerSet.getRegister(rs1);
                const address = this.mmu_translate(rs1Value + imm, 'R');
                const half = this.ram.getInt16(address, true);
                registerSet.setRegister(rd, half);
                this.pc += 4;
                break;
            }
            case 0x2: {
                const rs1Value = registerSet.getRegister(rs1);
                const address = this.mmu_translate(rs1Value + imm, 'R');
                const word = this.ram.getInt32(address, true);
                registerSet.setRegister(rd, word);
                this.pc += 4;
                break;
            }
            case 0x4: {
                const rs1Value = registerSet.getRegister(rs1);
                const address = this.mmu_translate(rs1Value + imm, 'R');
                const byte = this.ram.getUint8(address);
                registerSet.setRegister(rd, byte);
                this.pc += 4;
                break;
            }
            case 0x5: {
                const rs1Value = registerSet.getRegister(rs1);
                const address = this.mmu_translate(rs1Value + imm, 'R');
                const half = this.ram.getUint16(address, true);
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
            // RISC-V JALR: target address is (rs1 + imm) with bit 0 cleared.
            this.pc = (rs1Value + imm) & ~1;
            return;
        }
        else {
            throw new Error('Invalid Instruction');
        }
    }
    mmu_translate(address, accessType) {
        // 1. Determine Effective Privilege Mode
        let effectivePrivilege = this.currentPrivilege;
        if (this.currentPrivilege === Privilege.Machine) {
            const mstatus = this.get_csr(CSR_MSTATUS);
            const mprv = (mstatus >> 17) & 1;
            if (mprv === 1 && accessType !== 'X') {
                effectivePrivilege = (mstatus >> 11) & 0b11; // MPP
            }
            else {
                // Must return unsigned to avoid RangeError in DataView
                return address >>> 0;
            }
        }
        const satp = this.get_csr(CSR_SATP);
        const pagingEnabled = (satp >>> 31) === 1;
        if (!pagingEnabled)
            return address >>> 0;
        const vpn = address & 0xFFFFF000;
        const cached = this.mmu_cache.get(vpn);
        if (cached !== undefined) {
            return cached | (address & 0xFFF);
        }
        // 2. Parse Virtual Address
        const vpn1 = (address >>> 22) & 0x3FF;
        const vpn0 = (address >>> 12) & 0x3FF;
        // 3. Level 1 Walk (Root)
        const rootPPN = satp & 0x3FFFFF;
        const rootTableAddr = (rootPPN << 12) >>> 0; // Force unsigned physical address
        const pte1 = this.ram.getUint32(rootTableAddr + (vpn1 << 2), true);
        if ((pte1 & 1) === 0)
            throw new Error(`Page Fault: Invalid Level 1 at VA 0x${address.toString(16)}`);
        // Check for MegaPage (R, W, or X bits set at Level 1)
        if ((pte1 & 0xE) !== 0) {
            const pte1ppn0 = (pte1 >>> 10) & 0x3FF;
            if (pte1ppn0 !== 0)
                throw new Error('Page Fault: Misaligned superpage');
            return this.check_permissions(vpn, pte1, address, effectivePrivilege, accessType, true);
        }
        // 4. Level 0 Walk (Leaf)
        const pte1ppn = (pte1 >>> 10) & 0x3FFFFF;
        const leafTableAddr = (pte1ppn << 12) >>> 0; // Force unsigned physical address
        const pte0 = this.ram.getUint32(leafTableAddr + (vpn0 << 2), true);
        if ((pte0 & 1) === 0)
            throw new Error(`Page Fault: Invalid Level 0 at VA 0x${address.toString(16)}`);
        // Level 0 must have at least one R,W,X bit set
        if ((pte0 & 0xE) === 0)
            throw new Error('Page Fault: Level 0 is not a leaf');
        return this.check_permissions(vpn, pte0, address, effectivePrivilege, accessType, false);
    }
    // Check permissions for PTE
    check_permissions(vpn, pte, vAddr, priv, type, isMega) {
        const r = (pte >> 1) & 1;
        const w = (pte >> 2) & 1;
        const x = (pte >> 3) & 1;
        const u = (pte >> 4) & 1;
        const a = (pte >> 6) & 1;
        const d = (pte >> 7) & 1;
        // A. Privilege Checks
        if (priv === Privilege.User && u === 0)
            throw new Error('Fault: User accessing Supervisor page');
        if (priv === Privilege.Supervisor && u === 1) {
            const sum = (this.get_csr(CSR_MSTATUS) >> 18) & 1;
            if (sum === 0)
                throw new Error('Fault: Supervisor accessing User page without SUM');
        }
        // B. Access Type Checks
        if (type === 'R' && !r)
            throw new Error('Fault: Read prohibited');
        if (type === 'W' && !w)
            throw new Error('Fault: Write prohibited');
        if (type === 'X' && !x)
            throw new Error('Fault: Execute prohibited');
        // C. Dirty/Accessed Bits
        if (!a)
            throw new Error('Fault: Page not marked Accessed');
        if (type === 'W' && !d)
            throw new Error('Fault: Page not marked Dirty');
        // D. Final Address Calculation
        const ppn = (pte >>> 10) & 0x3FFFFF;
        let addr;
        if (isMega) {
            const megaOffset = vAddr & 0x3FFFFF;
            addr = (((ppn & 0x3FFC00) << 12) | megaOffset) >>> 0;
        }
        else {
            addr = ((ppn << 12) | (vAddr & 0xFFF)) >>> 0;
        }
        this.mmu_cache.set(vpn, addr & ~0xFFF >>> 0);
        return addr;
    }
    set_csr(csr, value) {
        this.csr[csr] = value;
        if (csr === CSR_SATP)
            this.mmu_cache.clear();
    }
    get_csr(csr) {
        if (csr === CSR_CYCLE)
            return this.cycle_count >>> 0; // low 32 bits
        if (csr === CSR_CYCLEH)
            return Math.floor(this.cycle_count / 0x100000000) >>> 0; // high 32 bits
        return this.csr[csr];
    }
    set_csr_mstatus_bit(bit, value) {
        if (value) {
            this.set_csr(CSR_MSTATUS, this.get_csr(CSR_MSTATUS) | (1 << bit));
        }
        else {
            this.set_csr(CSR_MSTATUS, this.get_csr(CSR_MSTATUS) & ~(1 << bit));
        }
    }
    get_csr_mstatus_bit(bit) {
        return (this.get_csr(CSR_MSTATUS) >> bit) & 1;
    }
    set_csr_mstatus_privilege(privilege) {
        // Set bits 12:11
        this.set_csr(CSR_MSTATUS, (this.get_csr(CSR_MSTATUS) & ~0b110000000000) | (privilege << 11));
    }
    get_csr_mstatus_privilege() {
        return (this.csr[CSR_MSTATUS] & 0b110000000000) >> 11;
    }
    trap(cause, mtval = 0) {
        const delegatedToSupervisor = this.currentPrivilege !== Privilege.Machine &&
            (((this.get_csr(CSR_MEDELEG) >>> cause) & 1) === 1);
        if (delegatedToSupervisor) {
            this.set_csr(CSR_SEPC, this.pc);
            this.set_csr(CSR_SCAUSE, cause);
            this.set_csr(CSR_STVAL, mtval);
            this.set_csr_mstatus_bit(CSR_MSTATUS_SPIE, this.get_csr_mstatus_bit(CSR_MSTATUS_SIE));
            this.set_csr_mstatus_bit(CSR_MSTATUS_SIE, 0);
            this.set_csr_mstatus_bit(CSR_MSTATUS_SPP, this.currentPrivilege === Privilege.Supervisor ? 1 : 0);
            this.pc = this.get_csr(CSR_STVEC) & ~3; // Align to 4-byte boundary
            this.currentPrivilege = Privilege.Supervisor;
            return;
        }
        this.set_csr(CSR_MEPC, this.pc);
        this.set_csr(CSR_MCAUSE, cause);
        this.set_csr(CSR_MTVAL, mtval);
        this.set_csr_mstatus_bit(CSR_MSTATUS_MPIE, this.get_csr_mstatus_bit(CSR_MSTATUS_MIE));
        this.set_csr_mstatus_bit(CSR_MSTATUS_MIE, 0);
        this.set_csr_mstatus_privilege(this.currentPrivilege);
        this.pc = this.get_csr(CSR_MTVEC) & ~3; // Align to 4-byte boundary
        this.currentPrivilege = Privilege.Machine;
    }
    illegal_instruction(instruction) {
        console.error('Encountered illegal instruction:', instruction, this.pc);
        this.trap(2, instruction);
    }
    is_csr_addr_readonly(csr) {
        return ((csr >> 10) & 0x3) === 0x3; // bits [11:10] === 11
    }
    get_csr_addr_privilege(csr) {
        return ((csr >> 8) & 0x3); // bits [9:8]
    }
    executeI_Type73(instruction) {
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
                }
                else if (instruction.binary === 0b00000000000100000000000001110011) {
                    // EBREAK
                    this.trap(3);
                    break;
                }
                else if ((instruction.binary & 0xFE007FFF) === 0x12000073) {
                    // SFENCE.VMA
                    this.mmu_cache.clear();
                    this.pc += 4;
                    return;
                }
                else if (instruction.binary === 0b00110000001000000000000001110011) {
                    // MRET
                    if (this.currentPrivilege !== Privilege.Machine) {
                        this.illegal_instruction(instruction.binary);
                        return;
                    }
                    this.pc = this.csr[CSR_MEPC];
                    this.currentPrivilege = this.get_csr_mstatus_privilege(); // restore privilege from MPP
                    this.set_csr_mstatus_bit(CSR_MSTATUS_MIE, this.get_csr_mstatus_bit(CSR_MSTATUS_MPIE));
                    this.set_csr_mstatus_bit(CSR_MSTATUS_MPIE, 1);
                    this.set_csr_mstatus_privilege(Privilege.User); // clear MPP
                    break;
                }
                else if (instruction.binary === 0b00010000001000000000000001110011) {
                    // SRET
                    if (this.currentPrivilege === Privilege.User) {
                        this.illegal_instruction(instruction.binary);
                        return;
                    }
                    this.pc = this.csr[CSR_SEPC];
                    this.currentPrivilege = this.get_csr_mstatus_bit(CSR_MSTATUS_SPP) ? Privilege.Supervisor : Privilege.User;
                    this.set_csr_mstatus_bit(CSR_MSTATUS_SIE, this.get_csr_mstatus_bit(CSR_MSTATUS_SPIE));
                    this.set_csr_mstatus_bit(CSR_MSTATUS_SPIE, 1);
                    this.set_csr_mstatus_bit(CSR_MSTATUS_SPP, 0);
                    break;
                }
                else {
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
                const csrrwOld = this.get_csr(csr);
                const csrrwRs1 = this.registerSet.getRegister(rs1);
                if (rd !== 0) {
                    this.registerSet.setRegister(rd, csrrwOld);
                }
                this.set_csr(csr, csrrwRs1);
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
                const csrrsOld = this.get_csr(csr);
                const csrrsRs1 = this.registerSet.getRegister(rs1);
                this.registerSet.setRegister(rd, csrrsOld);
                if (rs1 !== 0) {
                    this.set_csr(csr, csrrsOld | csrrsRs1);
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
                const csrrcOld = this.get_csr(csr);
                const csrrcRs1 = this.registerSet.getRegister(rs1);
                this.registerSet.setRegister(rd, csrrcOld);
                if (rs1 !== 0) {
                    this.set_csr(csr, csrrcOld & ~csrrcRs1);
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
    executeS_Type(opcode, instruction) {
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
                const byte = (0, binaryFunctions_1.getRange)(rs2Value, 7, 0);
                const address = this.mmu_translate(rs1Value + imm, 'W');
                this.ram.setInt8(address, byte);
                break;
            }
            case 0x1: {
                const { rs1, rs2, imm } = instruction;
                const { registerSet, ram } = this;
                const rs1Value = registerSet.getRegister(rs1);
                const rs2Value = registerSet.getRegister(rs2);
                const half = (0, binaryFunctions_1.getRange)(rs2Value, 15, 0);
                const address = this.mmu_translate(rs1Value + imm, 'W');
                this.ram.setInt16(address, half, true);
                break;
            }
            case 0x2: {
                const { rs1, rs2, imm } = instruction;
                const { registerSet, ram } = this;
                const rs1Value = registerSet.getRegister(rs1);
                const rs2Value = registerSet.getRegister(rs2);
                const address = this.mmu_translate(rs1Value + imm, 'W');
                this.ram.setInt32(address, rs2Value, true);
                break;
            }
            default:
                this.illegal_instruction(instruction.binary);
                return;
        }
        this.pc += 4;
    }
    executeB_Type63(instruction) {
        const { func3, rs1, rs2, imm } = instruction;
        switch (func3) {
            case 0x0: {
                const rs1Value = this.registerSet.getRegister(rs1);
                const rs2Value = this.registerSet.getRegister(rs2);
                if (rs1Value === rs2Value) {
                    this.pc += imm;
                }
                else {
                    this.pc += 4;
                }
                break;
            }
            case 0x1: {
                const rs1Value = this.registerSet.getRegister(rs1);
                const rs2Value = this.registerSet.getRegister(rs2);
                if (rs1Value !== rs2Value) {
                    this.pc += imm;
                }
                else {
                    this.pc += 4;
                }
                break;
            }
            case 0x4: {
                const rs1Value = this.registerSet.getRegister(rs1);
                const rs2Value = this.registerSet.getRegister(rs2);
                if (rs1Value < rs2Value) {
                    this.pc += imm;
                }
                else {
                    this.pc += 4;
                }
                break;
            }
            case 0x5: {
                const rs1Value = this.registerSet.getRegister(rs1);
                const rs2Value = this.registerSet.getRegister(rs2);
                if (rs1Value >= rs2Value) {
                    this.pc += imm;
                }
                else {
                    this.pc += 4;
                }
                break;
            }
            case 0x6: {
                const rs1Value = this.registerSet.getRegisterU(rs1);
                const rs2Value = this.registerSet.getRegisterU(rs2);
                if (rs1Value < rs2Value) {
                    this.pc += imm;
                }
                else {
                    this.pc += 4;
                }
                break;
            }
            case 0x7: {
                const rs1Value = this.registerSet.getRegisterU(rs1);
                const rs2Value = this.registerSet.getRegisterU(rs2);
                if (rs1Value >= rs2Value) {
                    this.pc += imm;
                }
                else {
                    this.pc += 4;
                }
                break;
            }
            default:
                this.illegal_instruction(instruction.binary);
                return;
        }
    }
    executeU_Type37(instruction) {
        const { rd, immU } = instruction;
        this.registerSet.setRegister(rd, immU);
        this.pc += 4;
    }
    executeU_Type17(instruction) {
        const { rd, immU } = instruction;
        this.registerSet.setRegister(rd, immU + this.pc);
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
