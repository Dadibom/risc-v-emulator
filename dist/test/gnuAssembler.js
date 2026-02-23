"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GnuAssembler = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const AS = 'riscv64-unknown-elf-as';
const OBJCOPY = 'riscv64-unknown-elf-objcopy';
const MARCH = '-march=rv32i_zicsr -mabi=ilp32';
function assembleToBuffer(lines) {
    const id = `${Date.now()}_${process.pid}`;
    const src = (0, path_1.join)((0, os_1.tmpdir)(), `riscv_${id}.s`);
    const obj = (0, path_1.join)((0, os_1.tmpdir)(), `riscv_${id}.o`);
    const bin = (0, path_1.join)((0, os_1.tmpdir)(), `riscv_${id}.bin`);
    try {
        (0, fs_1.writeFileSync)(src, lines.join('\n') + '\n');
        (0, child_process_1.execSync)(`${AS} ${MARCH} -o ${obj} ${src}`, { stdio: 'pipe' });
        (0, child_process_1.execSync)(`${OBJCOPY} -O binary ${obj} ${bin}`, { stdio: 'pipe' });
        return (0, fs_1.readFileSync)(bin);
    }
    finally {
        for (const f of [src, obj, bin]) {
            try {
                (0, fs_1.unlinkSync)(f);
            }
            catch { }
        }
    }
}
exports.GnuAssembler = {
    assembleLine(instruction) {
        const buf = assembleToBuffer([instruction]);
        const binary = buf.readUInt32LE(0);
        return { binary };
    },
    assemble(instructions) {
        const buf = assembleToBuffer(instructions);
        const ab = new ArrayBuffer(buf.length);
        Buffer.from(ab).set(buf);
        return ab;
    },
};
