# js-pdp8
An emulator of PDP 8 (simplified) written in Javascript.

## Info

The emulator library is inside the `lib` folder. There you can find the instructions to how to use the emulator inside NodeJS. You can also build a compatible js code to import inside the browser.

An example of *Web App* is in the folder `app`. This application can be launched like a website with e simple static server or with *NW.js*. Check the README file for more details.

## Reference

### Instruction set

#### Command schema

|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Bit 1 - 4 = opcode.
Bit 5 - 16 = address.


#### Memory reference instructions

**Assembly**: [LABEL], MRI Addr [I]

* Addr can be a LABEL

|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|0/1|x |x |x |  | | | | | | | | | | | |

Bit 1 = Direct/Indirect address (respectively 0 and 1).
Bit 2 - 4 = operation (different from 111).
Bit 5 - 16 = address of the operand.

  * AND = 000 -> And operation between AC and addressed cell
  * ADD = 001 -> Sum of AC and addressed cell
  * LDA = 010 -> Load addressed cell in AC
  * STA = 011 -> Store in the addressed cell the content of AC
  * BUN = 100 -> Unconditionally jump to addressed cell
  * BSA = 101 -> Saving the PC in the addressed cell and jump to the next cell to the one addressed
  * ISZ = 110 -> Increases by 1 the contents of the cell addressed and if equal to 0, skips the next instruction. The increase by 1 is in place using the MBR register and not E-AC, then you can't check the overflow of this operation.

#### Register reference instructions

**Assembly**: [LABEL], RRI

|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|0 |1 |1 |1 |  | | | | | | | | | | | |

Bit 1 - 4 = type of instruction (always 0111).
Bit 5 - 16 = operation to execute.

  * CLA = 0111 1000 0000 0000 -> Clear AC
  * CLE = 0111 0100 0000 0000 -> Clear E
  * CMA = 0111 0010 0000 0000 -> Logically complements the AC content
  * CME = 0111 0001 0000 0000 -> Logically complements the E content
  * CIR = 0111 0000 1000 0000 -> Right shift of E-AC
  * CIL = 0111 0000 0100 0000 -> Left shift of E-AC
  * INC = 0111 0000 0010 0000 -> Increase by 1 the AC content
  * SPA = 0111 0000 0001 0000 -> Jump next instruction if AC > 0
  * SNA = 0111 0000 0000 1000 -> Jump next instruction if AC < 0
  * SZA = 0111 0000 0000 0100 -> Jump next instruction if AC = 0
  * SZE = 0111 0000 0000 0010 -> Jump next instruction if E = 0
  * HLT = 0111 0000 0000 0001 -> Stop the system

#### I/O instructions

**Assembly**: [LABEL], I/O

|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|1 |1 |1 |1 |  | | | | | | | | | | | |

Bit 1 - 4 = type of instruction (always 1111).
Bit 5 - 16 = operation to execute.

  * INP = 1111 1000 0000 0000 -> Load in AC the ASCII code of a character input
  * OUT = 1111 0100 0000 0000 -> Output of one character whose ASCII code is in AC
  * ION = 1111 0000 1000 0000 -> Enable interrupt
  * IOF = 1111 0000 0100 0000 -> Disable interrupt


### Registers available

  * Program Counter (PC) 12 bit
  * Memory Address Register (MAR) 12 bit
  * Memory Buffer Register (MBR) 16 bit
  * I 1 bit
  * E 1 bit (register for the reminder of last operation)
  * Accumulator A (AC) 16 bit
  * Operation Code (OPR) 3 bit
  * S, F ed R da 1 bit (Control unit)

#### Pseudo instructions for the compiler

  * ORG N = Start the code from the N location (N is an hex number).
  * END = end of the program.
  * DEC N = decimal number in two's complement. N can be written as module and sign and the compiler will convert it in two's complement.
  * HEX N = hexadecimal number. Can be only positive.
  * Campo LABEL = an address can have a label. Next the label you have to write a comma, so the command will be separated from the label (example: "my_label, HLT" or "my_num, DEC -1"). You can write this label to refer to that memory cell.
  * Comment = like in C++ ("// ..." and "/* ... */")

**NOTE**: All addresses are in hexadecimal.

### Execution cycle

There are 4 steps involved for a complete cycle but not all of them are indispensable:

  * FETCH (read of the current instruction)
  * INDIRECT (resolution of an indirect address)
  * EXECUTION (execution of the instruction)
  * INTERRUPT (execution of an interrupt instruction)

Each of these steps has 4 clock cycles to complete (clock starts from 0). All available branches
of this cycle are these:

  * `FETCH -> EXECUTION`: memory and register instructions
  * `FETCH -> INDIRECT -> EXECUTION`: only memory instructions
  * `FETCH -> INTERRUPT`: interrupt instructions
