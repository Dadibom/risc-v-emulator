type ExtensionMap = {
    M: boolean;
};
export declare class CPU {
    pc: number;
    registerSet: RegisterSet;
    ram: DataView;
    extensions: ExtensionMap;
    constructor(ram: ArrayBuffer, pc: number, extensions?: ExtensionMap);
    executionStep(): void;
    executeInstruction(instruction: number): void;
    private executeR_Type33;
    private executeI_Type03;
    private executeI_Type13;
    private executeI_Type67;
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
