import { parse } from "./parser";

export function assemble(asm: string[]): ArrayBuffer {

  const parsedAssembly = parse(asm);

  // TODO: link symbols, labels, sections, files etc.

  const binary = new ArrayBuffer(parsedAssembly.length * 4);

  // TODO: actually convert assembly into binary values

  return binary;
}