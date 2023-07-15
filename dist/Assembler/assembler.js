"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assemble = void 0;
const parser_1 = require("./parser");
function assemble(asm) {
    const parsedAssembly = (0, parser_1.parse)(asm);
    // TODO: link symbols, labels, sections, files etc.
    const binary = new ArrayBuffer(parsedAssembly.length * 4);
    // TODO: actually convert assembly into binary values
    return binary;
}
exports.assemble = assemble;
