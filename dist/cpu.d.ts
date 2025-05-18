export declare class CPU {
    pc: number;
    registerSet: RegisterSet;
    ram: DataView;
    constructor(ram: ArrayBuffer, pc: number);
    executionStep(): void;
    executeInstruction(instruction: number): void;
    private executeR_Type;
    private executeI_Type;
    private executeS_Type;
    private executeB_Type;
    private executeU_Type;
    private executeJ_Type;
}
export declare class RegisterSet {
    private registers;
    constructor(numRegisters: number);
    getRegister(index: number): number;
    getRegisterU(index: number): number;
    setRegister(index: number, value: number): void;
    setRegisterU(index: number, value: number): void;
}
