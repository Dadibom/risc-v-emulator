import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const AS = 'riscv64-unknown-elf-as';
const OBJCOPY = 'riscv64-unknown-elf-objcopy';
const MARCH = '-march=rv32i_zicsr -mabi=ilp32';

function assembleToBuffer(lines: string[]): Buffer {
    const id = `${Date.now()}_${process.pid}`;
    const src = join(tmpdir(), `riscv_${id}.s`);
    const obj = join(tmpdir(), `riscv_${id}.o`);
    const bin = join(tmpdir(), `riscv_${id}.bin`);

    try {
        writeFileSync(src, lines.join('\n') + '\n');
        execSync(`${AS} ${MARCH} -o ${obj} ${src}`, { stdio: 'pipe' });
        execSync(`${OBJCOPY} -O binary ${obj} ${bin}`, { stdio: 'pipe' });
        return readFileSync(bin);
    } finally {
        for (const f of [src, obj, bin]) {
            try { unlinkSync(f); } catch {}
        }
    }
}

export const GnuAssembler = {
    assembleLine(instruction: string): { binary: number } {
        const buf = assembleToBuffer([instruction]);
        const binary = buf.readUInt32LE(0);
        return { binary };
    },

    assemble(instructions: string[]): ArrayBuffer {
        const buf = assembleToBuffer(instructions);
        const ab = new ArrayBuffer(buf.length);
        Buffer.from(ab).set(buf);
        return ab;
    },
};
