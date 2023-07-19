import { Instruction } from "./instruction";
export declare class Assembler {
    static assemble(asm: string[]): ArrayBuffer;
    static assembleLine(asm: string): Instruction;
}
