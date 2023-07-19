"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assembler_1 = require("./Assembler/assembler");
const cpu_1 = require("./cpu");
exports.default = {
    CPU: cpu_1.CPU,
    RegisterSet: cpu_1.RegisterSet,
    Assembler: assembler_1.Assembler
};
