# RISC-V Emulator

A RISC-V Emulator that runs on JavaScript, because Atwood's Law never fails to prove itself true.

**DISCLAIMER:** This package was primarily created for educational and experimental purposes. Expect bugs and missing/incomplete features.

## `CPU`

The `CPU` class holds the emulation logic for a RISC-V CPU. Currently the `CPU` class only supports the RV32I base instruction set.

### `registerSet`

**Type:** `RegisterSet`

Represents the 32 user-level base registers. Each register can be accessed and set by its index (0-31). Registers can be accessed or set as either signed or unsigned 32-bit integers.

This property is publicly scoped mostly for debugging purposes. In general use, there is no need to directly manipulate register values through this property.

### `ram`

**Type:** `DataView`

View of the buffer representing the RAM that the CPU has access to. The RISC-V ISA assumes the memory system is little-endian, meaning that the least significant byte of each word is stored in the lowest address. This view is initialized from the `ArrayBuffer` passed to the CPU's constructor.

Direct manipulation of values in RAM is necessary for memory-mapped I/O.

### `pc`

**Type:** `number`

Program counter. This number represents the location of the byte in RAM that the CPU is set to read an instruction from in its next execution step.

Besides debugging, this property is publicly scoped for the simulation of hardware interrupts and transfer of control to and from an operating system.

### `constructor(ram: ArrayBuffer, pc: number)`

`ram` - The buffer representing the RAM that the `CPU` will use to execute

`pc` - The address in RAM that the `pc` should initially point to

It is expected that the `ArrayBuffer` passed as `ram` already contains whatever program is being run, and that it is large enough to contain both the machine code for the program itself and any memory addresses that may be referenced in said program.

### `executionStep()`

Steps the `CPU` forward by one clock cycle. Note that because the hardware is being completely abstracted here, there is no guarantee that execution of this method will perfectly align with a single clock cycle on a physical RISC-V CPU.


## `RegisterSet`

Sets of user-level registers are implemented as a single `ArrayBuffer` behind the scenes. This class is meant to enforce set register widths and encapsulate expected functionality so that registers can be accessed by index without any possibility of overflow into surrounding registers or misaligned bytes during the read/write process.

### `constructor(numRegisters: number)`

`numRegisters` - The number of registers in the set

### `getRegister(index: number): number`

`index` - The index of the register being accessed

returns the value of the register as a signed 32-bit integer. The register at index 0 always returns a value of 0.

### `getRegisterU(index: number): number`

`index` - The index of the register being accessed

returns the value of the register as an unsigned 32-bit integer. The register at index 0 always returns a value of 0.

### `setRegister(index: number, value: number): number`

`index` - The index of the register being accessed

`value` - The value that the register is being set to

Sets the value of the register at the specified `index` to `value` as a signed 32-bit integer. Setting the value of the register at index 0 has no effect.

### `setRegisterU(index: number, value: number): number`

`index` - The index of the register being accessed

`value` - The value that the register is being set to

Sets the value of the register at the specified `index` to `value` as an unsigned 32-bit integer. Setting the value of the register at index 0 has no effect.

## `Assembler`

Contains static methods for converting programs written in the RISC-V assembly language to binary machine code. These methods are currently very limited; pseudo-instructions, symbols, labels, and sections are not yet supported.

### `assemble(asm: string[]): ArrayBuffer`

*static*

`asm` - The program in plaintext being assembled

returns an `ArrayBuffer` containing the entire program binary. The `ArrayBuffer` does not contain any space for general-purpose RAM, and so it is recommended to resize/rewrite the buffer before passing to the `CPU` constructor.

### `assembleLine(asm: string): Instruction`

*static*

`asm` - The assembly instruction in plaintext being assembled

returns an `Instruction` object which may be recast to specific instruction types (i.e. R-Type, J-Type, etc.) for ease of manipulation and use.

This method is publicly accessible for debugging and testing purposes. In general, there is no need to directly use this method.


