type ExtensionMap = {
    M: boolean;
};
declare enum Privilege {
    User = 0,
    Supervisor = 1,
    Machine = 3
}
export declare class CPU {
    pc: number;
    registerSet: RegisterSet;
    ram: DataView;
    csr: Uint32Array;
    currentPrivilege: Privilege;
    private readonly TLB_SIZE;
    private readonly TLB_MASK;
    private tlb_tags;
    private tlb_ppns;
    cycle_count: number;
    extensions: ExtensionMap;
    constructor(ram: ArrayBuffer, pc: number, extensions?: ExtensionMap);
    executionStep(): void;
    executeInstruction(instruction: number): void;
    private executeR_Type33;
    private executeI_Type03;
    private executeI_Type13;
    private executeI_Type67;
    mmu_translate(address: number, accessType: 'R' | 'W' | 'X'): number;
    private check_permissions;
    set_csr(csr: number, value: number): void;
    get_csr(csr: number): number;
    set_csr_mstatus_bit(bit: number, value: number): void;
    get_csr_mstatus_bit(bit: number): number;
    set_csr_mstatus_privilege(privilege: Privilege): void;
    get_csr_mstatus_privilege(): Privilege;
    trap(cause: number, mtval?: number): void;
    illegal_instruction(instruction: number): void;
    is_csr_addr_readonly(csr: number): boolean;
    get_csr_addr_privilege(csr: number): Privilege;
    private executeI_Type73;
    private executeS_Type;
    private executeB_Type63;
    private executeU_Type37;
    private executeU_Type17;
    private executeJ_Type6F;
}
export declare class RegisterSet {
    private registers;
    constructor(numRegisters: number);
    getRegister(index: number): number;
    getRegisterU(index: number): number;
    setRegister(index: number, value: number): void;
    setRegisterU(index: number, value: number): void;
}
export {};
