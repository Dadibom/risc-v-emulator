import { B_Type, I_Type, Instruction, J_Type, R_Type, S_Type, U_Type } from "./Assembler/instruction";
export declare class CPU {
    ram: ArrayBuffer;
    instructionPointer: number;
    registerSet: RegisterSet;
    constructor(ram: ArrayBuffer, instructionPointer: number);
    executeInstruction(instruction: Instruction): void;
    executeR_Type(instruction: R_Type): void;
    executeI_Type(instruction: I_Type): void;
    executeS_Type(instruction: S_Type): void;
    executeB_Type(instruction: B_Type): void;
    executeU_Type(instruction: U_Type): void;
    executeJ_Type(instruction: J_Type): void;
}
declare class RegisterSet {
    private registerBuffer;
    private registerView;
    constructor(numRegisters: number);
    getRegister(index: number): number;
    getRegisterU(index: number): number;
    setRegister(index: number, value: number): void;
    setRegisterU(index: number, value: number): void;
}
export {};
