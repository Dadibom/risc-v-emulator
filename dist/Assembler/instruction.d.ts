export declare enum InstructionType {
    R = 0,
    I = 1,
    S = 2,
    B = 3,
    U = 4,
    J = 5
}
export interface InstructionValues {
    binary?: number;
    opcode?: number;
    rd?: number;
    rs1?: number;
    rs2?: number;
    func3?: number;
    func7?: number;
    shamt?: number;
    imm?: number;
    type?: InstructionType;
}
export declare abstract class Instruction {
    binary: number;
    abstract type: InstructionType;
    constructor(options: InstructionValues);
    get opcode(): number;
    set opcode(value: number);
}
interface HasImmediate {
    imm: number;
}
export declare class R_Type extends Instruction {
    type: InstructionType;
    constructor(options: InstructionValues);
    get rd(): number;
    set rd(value: number);
    get func3(): number;
    set func3(value: number);
    get rs1(): number;
    set rs1(value: number);
    get rs2(): number;
    set rs2(value: number);
    get func7(): number;
    set func7(value: number);
}
export declare class I_Type extends Instruction implements HasImmediate {
    type: InstructionType;
    constructor(options: InstructionValues);
    get rd(): number;
    set rd(value: number);
    get func3(): number;
    set func3(value: number);
    get rs1(): number;
    set rs1(value: number);
    get func7(): number;
    set func7(value: number);
    get shamt(): number;
    set shamt(value: number);
    get imm(): number;
    set imm(value: number);
}
export declare class S_Type extends Instruction implements HasImmediate {
    type: InstructionType;
    constructor(options: InstructionValues);
    get func3(): number;
    set func3(value: number);
    get rs1(): number;
    set rs1(value: number);
    get rs2(): number;
    set rs2(value: number);
    get imm(): number;
    set imm(value: number);
}
export declare class B_Type extends Instruction implements HasImmediate {
    type: InstructionType;
    constructor(options: InstructionValues);
    get func3(): number;
    set func3(value: number);
    get rs1(): number;
    set rs1(value: number);
    get rs2(): number;
    set rs2(value: number);
    get imm(): number;
    set imm(value: number);
}
export declare class U_Type extends Instruction implements HasImmediate {
    type: InstructionType;
    constructor(options: InstructionValues);
    get rd(): number;
    set rd(value: number);
    get imm(): number;
    set imm(value: number);
}
export declare class J_Type extends Instruction implements HasImmediate {
    type: InstructionType;
    constructor(options: InstructionValues);
    get rd(): number;
    set rd(value: number);
    get imm(): number;
    set imm(value: number);
}
export {};
