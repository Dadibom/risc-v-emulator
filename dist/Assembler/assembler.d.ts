import { Instruction } from "./instruction";
export declare function assemble(asm: string[]): ArrayBuffer;
export declare function assembleLine(asm: string): Instruction;
