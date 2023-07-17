"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionType = exports.J_Type = exports.U_Type = exports.B_Type = exports.S_Type = exports.I_Type = exports.R_Type = exports.Instruction = void 0;
const binaryFunctions_1 = require("../binaryFunctions");
class Instruction {
    constructor(options) {
        if (options.binary) {
            this.binary = options.binary;
        }
        else if (options.opcode) {
            this.binary = 0;
            if (options.opcode) {
                this.binary = (0, binaryFunctions_1.setRange)(this.binary, options.opcode, 6, 0);
            }
            if (options.rd) {
                this.binary = (0, binaryFunctions_1.setRange)(this.binary, options.rd, 11, 7);
            }
            if (options.rs1) {
                this.binary = (0, binaryFunctions_1.setRange)(this.binary, options.rs1, 19, 15);
            }
            if (options.rs2) {
                this.binary = (0, binaryFunctions_1.setRange)(this.binary, options.rs2, 24, 20);
            }
            if (options.func3) {
                this.binary = (0, binaryFunctions_1.setRange)(this.binary, options.func3, 14, 12);
            }
            if (options.func7) {
                this.binary = (0, binaryFunctions_1.setRange)(this.binary, options.func7, 31, 25);
            }
            if (options.shamt) {
                this.binary = (0, binaryFunctions_1.setRange)(this.binary, options.shamt, 24, 20);
            }
        }
        else {
            throw new Error('Instruction must be constructed with at least a binary value OR opcode value');
        }
    }
    get opcode() {
        return (0, binaryFunctions_1.getRange)(this.binary, 6, 0);
    }
    set opcode(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 6, 0);
    }
}
exports.Instruction = Instruction;
class R_Type extends Instruction {
    constructor(options) {
        super(options);
        this.type = InstructionType.R;
    }
    get rd() {
        return (0, binaryFunctions_1.getRange)(this.binary, 11, 7);
    }
    set rd(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 11, 7);
    }
    get func3() {
        return (0, binaryFunctions_1.getRange)(this.binary, 14, 12);
    }
    set func3(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 14, 12);
    }
    get rs1() {
        return (0, binaryFunctions_1.getRange)(this.binary, 19, 15);
    }
    set rs1(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 19, 15);
    }
    get rs2() {
        return (0, binaryFunctions_1.getRange)(this.binary, 24, 20);
    }
    set rs2(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 24, 20);
    }
    get func7() {
        return (0, binaryFunctions_1.getRange)(this.binary, 31, 25);
    }
    set func7(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 31, 25);
    }
}
exports.R_Type = R_Type;
class I_Type extends Instruction {
    constructor(options) {
        super(options);
        this.type = InstructionType.I;
        if (options.imm) {
            this.imm = options.imm;
        }
    }
    get rd() {
        return (0, binaryFunctions_1.getRange)(this.binary, 11, 7);
    }
    set rd(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 11, 7);
    }
    get func3() {
        return (0, binaryFunctions_1.getRange)(this.binary, 14, 12);
    }
    set func3(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 14, 12);
    }
    get rs1() {
        return (0, binaryFunctions_1.getRange)(this.binary, 19, 15);
    }
    set rs1(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 19, 15);
    }
    get func7() {
        return (0, binaryFunctions_1.getRange)(this.binary, 31, 25);
    }
    set func7(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 31, 25);
    }
    get shamt() {
        return (0, binaryFunctions_1.getRange)(this.binary, 24, 20);
    }
    set shamt(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 24, 20);
    }
    get imm() {
        return (0, binaryFunctions_1.signExtend)(this.immU, 12);
    }
    get immU() {
        return (0, binaryFunctions_1.getRange)(this.binary, 31, 20);
    }
    set imm(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 31, 20);
    }
}
exports.I_Type = I_Type;
class S_Type extends Instruction {
    constructor(options) {
        super(options);
        this.type = InstructionType.S;
        if (options.imm) {
            this.imm = options.imm;
        }
    }
    get func3() {
        return (0, binaryFunctions_1.getRange)(this.binary, 14, 12);
    }
    set func3(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 14, 12);
    }
    get rs1() {
        return (0, binaryFunctions_1.getRange)(this.binary, 19, 15);
    }
    set rs1(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 19, 15);
    }
    get rs2() {
        return (0, binaryFunctions_1.getRange)(this.binary, 24, 20);
    }
    set rs2(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 24, 20);
    }
    get imm() {
        return (0, binaryFunctions_1.signExtend)(this.immU, 12);
    }
    get immU() {
        return (0, binaryFunctions_1.getRange)(this.binary, 11, 7) + ((0, binaryFunctions_1.getRange)(this.binary, 31, 25) << 13);
    }
    set imm(value) {
        const imm5 = (0, binaryFunctions_1.getRange)(value, 4, 0);
        const imm7 = (0, binaryFunctions_1.getRange)(value, 11, 5);
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, imm5, 11, 7);
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, imm7, 31, 25);
    }
}
exports.S_Type = S_Type;
class B_Type extends Instruction {
    constructor(options) {
        super(options);
        this.type = InstructionType.B;
        if (options.imm) {
            this.imm = options.imm;
        }
    }
    get func3() {
        return (0, binaryFunctions_1.getRange)(this.binary, 14, 12);
    }
    set func3(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 14, 12);
    }
    get rs1() {
        return (0, binaryFunctions_1.getRange)(this.binary, 19, 15);
    }
    set rs1(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 19, 15);
    }
    get rs2() {
        return (0, binaryFunctions_1.getRange)(this.binary, 24, 20);
    }
    set rs2(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 24, 20);
    }
    get imm() {
        return (0, binaryFunctions_1.signExtend)(this.immU, 13);
    }
    get immU() {
        const imm5 = (0, binaryFunctions_1.getRange)(this.binary, 11, 7);
        const imm7 = (0, binaryFunctions_1.getRange)(this.binary, 31, 25);
        return (((0, binaryFunctions_1.getRange)(imm5, 4, 1) << 1) +
            ((0, binaryFunctions_1.getBit)(imm5, 0) << 11) +
            ((0, binaryFunctions_1.getRange)(imm7, 5, 0) << 5) +
            ((0, binaryFunctions_1.getBit)(imm7, 6) << 12));
    }
    set imm(value) {
        const imm4_1 = (0, binaryFunctions_1.getRange)(value, 4, 1);
        const imm10_5 = (0, binaryFunctions_1.getRange)(value, 10, 5);
        const imm11 = (0, binaryFunctions_1.getBit)(value, 11);
        const imm12 = (0, binaryFunctions_1.getBit)(value, 12);
        const imm5 = (imm4_1 << 1) + imm11;
        const imm7 = (imm12 << 6) + imm10_5;
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, imm5, 11, 7);
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, imm7, 31, 25);
    }
}
exports.B_Type = B_Type;
class U_Type extends Instruction {
    constructor(options) {
        super(options);
        this.type = InstructionType.U;
        if (options.imm) {
            this.imm = options.imm;
        }
    }
    get rd() {
        return (0, binaryFunctions_1.getRange)(this.binary, 11, 7);
    }
    set rd(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 11, 7);
    }
    get imm() {
        return (0, binaryFunctions_1.signExtend)(this.immU, 20);
    }
    get immU() {
        return (0, binaryFunctions_1.getRange)(this.binary, 31, 12) << 12;
    }
    set imm(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value >> 12, 31, 12);
    }
}
exports.U_Type = U_Type;
class J_Type extends Instruction {
    constructor(options) {
        super(options);
        this.type = InstructionType.J;
        if (options.imm) {
            this.imm = options.imm;
        }
    }
    get rd() {
        return (0, binaryFunctions_1.getRange)(this.binary, 11, 7);
        ;
    }
    set rd(value) {
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, value, 11, 7);
    }
    get imm() {
        return (0, binaryFunctions_1.signExtend)(this.immU, 21);
    }
    get immU() {
        const imm = (0, binaryFunctions_1.getRange)(this.binary, 31, 12);
        return (((0, binaryFunctions_1.getRange)(imm, 18, 9) << 1) +
            ((0, binaryFunctions_1.getBit)(imm, 8) << 11) +
            ((0, binaryFunctions_1.getRange)(imm, 7, 0) << 12) +
            ((0, binaryFunctions_1.getBit)(imm, 19) << 20));
    }
    set imm(value) {
        const imm10_1 = (0, binaryFunctions_1.getRange)(value, 10, 1);
        const imm19_12 = (0, binaryFunctions_1.getRange)(value, 19, 12);
        const imm11 = (0, binaryFunctions_1.getBit)(value, 11);
        const imm20 = (0, binaryFunctions_1.getBit)(value, 20);
        const imm = (imm19_12 +
            (imm11 << 8) +
            (imm10_1 << 9) +
            (imm20 << 19));
        this.binary = (0, binaryFunctions_1.setRange)(this.binary, imm, 31, 12);
    }
}
exports.J_Type = J_Type;
var InstructionType;
(function (InstructionType) {
    InstructionType[InstructionType["R"] = 0] = "R";
    InstructionType[InstructionType["I"] = 1] = "I";
    InstructionType[InstructionType["S"] = 2] = "S";
    InstructionType[InstructionType["B"] = 3] = "B";
    InstructionType[InstructionType["U"] = 4] = "U";
    InstructionType[InstructionType["J"] = 5] = "J";
})(InstructionType || (exports.InstructionType = InstructionType = {}));
