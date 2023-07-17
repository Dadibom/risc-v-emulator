"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CPU = void 0;
const instruction_1 = require("./Assembler/instruction");
class CPU {
    constructor(ram, instructionPointer) {
        this.ram = ram;
        this.instructionPointer = instructionPointer;
        this.registerSet = new RegisterSet(32);
    }
    executeInstruction(instruction) {
        switch (instruction.constructor) {
            case instruction_1.R_Type:
                this.executeR_Type(instruction);
                break;
            case instruction_1.I_Type:
                this.executeI_Type(instruction);
                break;
            case instruction_1.S_Type:
                this.executeS_Type(instruction);
                break;
            case instruction_1.B_Type:
                this.executeB_Type(instruction);
                break;
            case instruction_1.U_Type:
                this.executeU_Type(instruction);
                break;
            case instruction_1.J_Type:
                this.executeJ_Type(instruction);
                break;
        }
    }
    executeR_Type(instruction) {
        // TODO: Implement R-Type execution
        throw new Error('R_Type');
    }
    executeI_Type(instruction) {
        // TODO: Implement I-Type execution
        throw new Error('I_Type');
    }
    executeS_Type(instruction) {
        // TODO: Implement S-Type execution
        throw new Error('S_Type');
    }
    executeB_Type(instruction) {
        // TODO: Implement B-Type execution
        throw new Error('B_Type');
    }
    executeU_Type(instruction) {
        // TODO: Implement U-Type execution
        throw new Error('U_Type');
    }
    executeJ_Type(instruction) {
        // TODO: Implement J-Type execution
        throw new Error('J_Type');
    }
}
exports.CPU = CPU;
class RegisterSet {
    constructor(numRegisters) {
        this.registerBuffer = new ArrayBuffer(numRegisters * 4);
        this.registerView = new DataView(this.registerBuffer);
    }
    getRegister(index) {
        return this.registerView.getInt32(index);
    }
    getRegisterU(index) {
        return this.registerView.getUint32(index);
    }
    setRegister(index, value) {
        this.registerView.setInt32(index, value);
    }
    setRegisterU(index, value) {
        this.registerView.setUint32(index, value);
    }
}
// class Register {
//   private buffer: ArrayBuffer = new ArrayBuffer(4);
//   private view: DataView = new DataView(this.buffer);
//   constructor() {}
//   get value(): number {
//     return this.view.getInt32(0);
//   }
//   get unsignedValue(): number {
//     return this.view.getUint32(0);
//   }
//   set value(value: number) {
//     this.view.setInt32(0, value);
//   }
//   set unsignedValue(value: number) {
//     this.view.setUint32(0, value);
//   }
// }
