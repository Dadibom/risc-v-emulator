export declare const GnuAssembler: {
    assembleLine(instruction: string): {
        binary: number;
    };
    assemble(instructions: string[]): ArrayBuffer;
};
