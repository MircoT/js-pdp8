(function () {
    'use strict';

    class Token {
        constructor(type, val) {
            this.type = type;
            this.val = val;
        }
    }
    
    const types = {
        NUMBER: Symbol('number'),
        HEX_NUM: Symbol('hex_number'),
        WORD: Symbol('word'),
        PUNCT: Symbol('punct'),
        BLANK: Symbol('blank'),
        NEWLINE: Symbol('newLine')
    }
    
    const states = {
        NONE: Symbol('none'),
        ERROR: Symbol('error'),
        END_CMD: Symbol('end_command'),
        COMMENT_INLINE: Symbol('comment_inline'),
        COMMENT_MULTILNE: Symbol('comment_multiline'),
        HEX_NUM: Symbol('hex_num'),
        HEX_VAL: Symbol('hex_val'),
        DEC_VAL: Symbol('dec_val'),
        ADDR_HEX_VAL: Symbol('addr_hex_val'),
        ADDR_DEC_VAL: Symbol('addr_dec_val'),
        ORG: Symbol('org'),
        LABEL: Symbol('label'),
        ADDRESS: Symbol('address'),
        INDIRECT: Symbol('indirect')
    }
    
    const binOpt = {
      AND: 0b0000000000000000,
      ADD: 0b0001000000000000,
      LDA: 0b0010000000000000,
      STA: 0b0011000000000000,
      BUN: 0b0100000000000000,
      BSA: 0b0101000000000000,
      ISZ: 0b0110000000000000,
      CLA: 0b0111100000000000,
      CLE: 0b0111010000000000,
      CMA: 0b0111001000000000,
      CME: 0b0111000100000000,
      CIR: 0b0111000010000000,
      CIL: 0b0111000001000000,
      INC: 0b0111000000100000,
      SPA: 0b0111000000010000,
      SNA: 0b0111000000001000,
      SZA: 0b0111000000000100,
      SZE: 0b0111000000000010,
      HLT: 0b0111000000000001,
      INP: 0b1111100000000000,
      OUT: 0b1111010000000000,
      ION: 0b1111000010000000,
      IOF: 0b1111000001000000
    }
    
    const isWord = (buff) => {
      let word = true;
      if (buff.charCodeAt(0) >= 48 && buff.charCodeAt(0) <= 57) {
          return false;
      }
      for(let c of buff) {
        let code = c.charCodeAt(0);
        word &= (code >= 65 && code <= 90 ||  // A-Z
          code >= 97 && code <= 122 ||  // a-z
          code === 95 ||
          code >= 48 && code <= 57  // 0-9
          ) ? true : false  // _
      }
      return (word) ? types.WORD : false;  
    }
    
    const isNumber = (buff) => {
      if (buff[0] === '-') buff = buff.slice(1);
      let number = true;
      for(let c of buff) {
        let code = c.charCodeAt(0);
        number &= (code >= 48 && code <= 57) ? true : false  // 0-9
      }
      return (number) ? types.NUMBER : false;
    }
    
    const isHex = (buff) => {
      let number = true;
      for(let c of buff) {
        let code = c.charCodeAt(0);
        number &= (code >= 48 && code <= 57 ||
                   code >= 65 && code <= 70 ||
                   code >= 97 && code <= 102) ? true : false  // 0-9
      }
      return (number) ? types.HEX_NUM : false;
    }
    
    const isPunct = (buff) => {
      let punct = true;
      for(let c of buff) {
        let code = c.charCodeAt(0);
        punct &= (code >= 33 && code <= 47 ||
          code >= 58 && code <= 63 ||
          code >= 91 && code <= 94 ||
          code >= 123 && code <= 126 ||
          code === 96) ? true : false;
      }
      return (punct) ? types.PUNCT : false; 
    }
    
    const isBlank = (buff) => {
      let blank = true;
      for(let c of buff) {
        blank &= (c === ' ' || c === '' || c === '\t') ? true : false;
      }
      return (blank) ? types.BLANK : false;
    }
    
    const isNewLine = (c) => {
      return (c === '\n') ? types.NEWLINE : false
    }
    
    const checkType = (buff) => {
      return isNumber(buff) || 
        isHex(buff) || 
        isWord(buff) ||
        isPunct(buff) ||
        isBlank(buff) ||
        isNewLine(buff);
    }
    
    const to_base_2 = (num, num_bit) => {
        // Mask to have complement 2 and then conversion
        let mask = (Math.pow(2, num_bit) - 1);
        let str = (num & mask).toString(2);
        while (str.length < num_bit) {
            str = '0' + str;
        }
        return str;
    }
    
    const exec = {
        CLA: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: AC <- 0 , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.AC = 0b0;
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        CLE: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E <- 0 , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.E = 0b0;
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        CMA: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: AC <- AC' , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.AC = (~pdp8_obj.registers.AC) & 0b1111111111111111;
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        CME: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E <- E' , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.E = (~pdp8_obj.registers.E) & 0b1;
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        CIR: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E-AC <- bit1 - E - (AC \ bit1) , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                let tmp = pdp8_obj.registers.E << 15;
                pdp8_obj.registers.E = pdp8_obj.registers.AC & 0b1;
                pdp8_obj.registers.AC = (pdp8_obj.registers.AC >>> 1) | tmp;
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        CIL: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E-AC <- AC-E , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                let tmp = pdp8_obj.registers.AC;
                pdp8_obj.registers.AC = (pdp8_obj.registers.AC << 1) | pdp8_obj.registers.E;
                pdp8_obj.registers.E = (tmp & 0b1000000000000000) >>> 15;
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        INC: (pdp8_obj) => {
            /* NOP
             * NOP
             * NOP
             * E-AC <- E-AC + 1 ,F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                let tmp = pdp8_obj.registers.AC + 1;
                pdp8_obj.registers.E = tmp & 0b10000000000000000;
                pdp8_obj.registers.AC = tmp & 0b1111111111111111;
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        SPA: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: if(AC>0) : 
             *      PC <- PC+1
             *    F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                if (pdp8_obj.registers.AC > 0) {
                    pdp8_obj.registers.PC++;
                }
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        SNA: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: if(AC<0) : 
             *      PC <- PC+1
             *    F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                if (pdp8_obj.registers.AC < 0) {
                    pdp8_obj.registers.PC++;
                }
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        SZA: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: if(AC==0) : 
             *      PC <- PC+1
             *    F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                if (pdp8_obj.registers.AC === 0) {
                    pdp8_obj.registers.PC++;
                }
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        SZE: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: if(E==0) : 
             *      PC <- PC+1
             *    F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                if (pdp8_obj.registers.E === 0) {
                    pdp8_obj.registers.PC++;
                }
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        HLT: (pdp8_obj) => {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: S <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.S = false;
            }
        },
        AND: (pdp8_obj) => {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 0b0000111111111111;
            }
            // MBR <- M
            else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
            }
            // AC <- AC AND MBR
            else if (pdp8_obj.status.clock === 2) {
                pdp8_obj.registers.AC &= pdp8_obj.registers.MBR;
            }
            // F <- 0
            else if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        ADD: (pdp8_obj) => {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 0b0000111111111111;
            }
            // MBR <- M
            else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
            }
            // E-AC <- AC + MBR
            else if (pdp8_obj.status.clock === 2) {
                let tmp = pdp8_obj.registers.AC + pdp8_obj.registers.MBR;
                pdp8_obj.registers.E = (tmp > 32767 || tmp < -32768) ? 1 : 0;
                pdp8_obj.registers.AC = tmp & 0b1111111111111111;
            }
            // F <- 0
            else if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        LDA: (pdp8_obj) => {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 0b0000111111111111;
            }
            // MBR <- M, AC <- 0
            else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
                pdp8_obj.registers.AC = 0b0;
            }
            // AC <- AC + MBR
            else if (pdp8_obj.status.clock === 2) {
                pdp8_obj.registers.AC += pdp8_obj.registers.MBR
            }
            // F <- 0
            else if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        STA: (pdp8_obj) => {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 0b0000111111111111;
            }
            // MBR <- AC
            else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.registers.MBR = pdp8_obj.registers.AC;
            }
            // M <- MBR
            else if (pdp8_obj.status.clock === 2) {
                pdp8_obj.ram.set(pdp8_obj.registers.MAR, pdp8_obj.registers.MBR);
            }
            // F <- 0
            else if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        BUN: (pdp8_obj) => {
            // PC <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.PC = pdp8_obj.registers.MBR & 0b0000111111111111;
            }
            // NOP
            // NOP
            // F <- 0
            else if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        BSA: (pdp8_obj) => {
            // MAR <- MBR(AD) , MBR(AD) <- PC
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 0b0000111111111111;
                pdp8_obj.registers.MBR &= 0b1111000000000000;
                pdp8_obj.registers.MBR |= pdp8_obj.registers.PC;
            }
            // M <- MBR
            else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.ram.set(pdp8_obj.registers.MAR, pdp8_obj.registers.MBR);
            }
            // PC <- MAR+1
            else if (pdp8_obj.status.clock === 2) {
                pdp8_obj.registers.PC = pdp8_obj.registers.MAR + 1;
            }
            // F <- 0
            else if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        ISZ: (pdp8_obj) => {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 0b0000111111111111;
            }
            // MBR <- M
            else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
            }
            // MBR <- MBR + 1
            else if (pdp8_obj.status.clock === 2) {
                pdp8_obj.registers.MBR++;
                pdp8_obj.registers.MBR &= 0b1111111111111111;
            }
            /* M <- MBR , 
             * if (MBR == 0) PC = PC + 1
             * F <- 0
             */
            else if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ram.set(pdp8_obj.registers.MAR, pdp8_obj.registers.MBR);
                if (pdp8_obj.registers.MBR === 0) {
                    pdp8_obj.registers.PC++;
                }
                pdp8_obj.ctrlUnit.F = 0;
            }
        },
        ION: (pdp8_obj) => {
            /*
             * NOP
             * NOP
             * NOP
             * INT <- true , F <- 0 , R <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.INT = true;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.ctrlUnit.R = 0;
            }
        },
        IOF: (pdp8_obj) => {
            /*
             * NOP
             * NOP
             * NOP
             * INT <- true , F <- 0 , R <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.INT = false;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.ctrlUnit.R = 0;
            }
        },
        INP: (pdp8_obj) => {
            /*
             * NOP
             * NOP
             * NOP
             * AC <- input_buf , F <- 0 , R <- 0
             */
            if (pdp8_obj.status.clock === 2) {
                if (pdp8_obj.ctrlUnit.INT) {
                    pdp8_obj.IO.wait = true;   
                }   
            }
            else if (pdp8_obj.status.clock === 3) {
                if (pdp8_obj.ctrlUnit.INT) {
                    if (pdp8_obj.IO.inp_buff !== -1) {
                        pdp8_obj.registers.AC = pdp8_obj.IO.inp_buff;
                        pdp8_obj.ctrlUnit.F = 0;
                        pdp8_obj.ctrlUnit.R = 0;
                        pdp8_obj.IO.inp_buff = -1;
                    }
                }
                else {
                    pdp8_obj.ctrlUnit.F = 0;
                    pdp8_obj.ctrlUnit.R = 0;
                }
                pdp8_obj.IO.wait = false;
            }
        },
        OUT: (pdp8_obj) => {
            /*
             * NOP
             * NOP
             * NOP
             * screen <- AC , F <- 0 , R <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                if (pdp8_obj.ctrlUnit.INT === true) {
                    pdp8_obj.IO.screen += String.fromCharCode(pdp8_obj.registers.AC);
                }
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.ctrlUnit.R = 0;
            }
        }
    }
    
    const fetch = (pdp8_obj) => {
        // MAR <- PC
        if (pdp8_obj.status.clock === 0) {
            pdp8_obj.registers.MAR = pdp8_obj.registers.PC;
            pdp8_obj.status.current_add_cmd = pdp8_obj.registers.MAR;
        }
        // MBR <- M , PC <- PC+1
        else if (pdp8_obj.status.clock === 1) {
            pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
            pdp8_obj.registers.PC++;
        }
        // OPR <- MBR(OP) , I <- MBR(I)
        else if (pdp8_obj.status.clock === 2) {
            pdp8_obj.registers.OPR = (pdp8_obj.registers.MBR & 0b0111000000000000) >> 12;
            pdp8_obj.registers.I = (pdp8_obj.registers.MBR & 0b1000000000000000) >> 15;
        }
        /*
         * if I == 1 && OPR != 111 => R <- 1
         * else F <- 1
         */
        else if (pdp8_obj.status.clock === 3) {
            if (pdp8_obj.registers.I === 1 && pdp8_obj.registers.OPR !== 7) {
                pdp8_obj.ctrlUnit.R = 1;
            }
            else {
                pdp8_obj.ctrlUnit.F = 1;
            }
        }
    }
    
    const indirect = (pdp8_obj) => {
        // MAR <- MBR(AD)
        if (pdp8_obj.status.clock === 0) {
            pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 0b0000111111111111;
        }
        // MBR <- M
        else if (pdp8_obj.status.clock === 1) {
            pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
        }
        // NOP
        else if (pdp8_obj.status.clock === 2) {
            // Nothing to do... :(
        }
        // F <- 1 , R <- 0
        else if (pdp8_obj.status.clock === 3) {
            pdp8_obj.ctrlUnit.R = 0;
            pdp8_obj.ctrlUnit.F = 1;
        }
    }
    
    const execute = (pdp8_obj) => {
        if (pdp8_obj.registers.I === 1 && pdp8_obj.registers.OPR === 7) {
            pdp8_obj.ctrlUnit.R = 1;
        }
        else if (pdp8_obj.registers.I === 0 && pdp8_obj.registers.OPR === 7) {
            if (pdp8_obj.registers.MBR === binOpt.CLA) exec.CLA(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.CLE) exec.CLE(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.CMA) exec.CMA(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.CME) exec.CME(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.CIR) exec.CIR(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.CIL) exec.CIL(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.INC) exec.INC(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.SPA) exec.SPA(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.SNA) exec.SNA(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.SZA) exec.SZA(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.SZE) exec.SZE(pdp8_obj);
            else if (pdp8_obj.registers.MBR === binOpt.HLT) exec.HLT(pdp8_obj);
        }
        else {
            if (pdp8_obj.registers.OPR === ((binOpt.AND & 0b0111000000000000) >> 12)) exec.AND(pdp8_obj);
            else if (pdp8_obj.registers.OPR === ((binOpt.ADD & 0b0111000000000000) >> 12)) exec.ADD(pdp8_obj);
            else if (pdp8_obj.registers.OPR === ((binOpt.LDA & 0b0111000000000000) >> 12)) exec.LDA(pdp8_obj);
            else if (pdp8_obj.registers.OPR === ((binOpt.STA & 0b0111000000000000) >> 12)) exec.STA(pdp8_obj);
            else if (pdp8_obj.registers.OPR === ((binOpt.BUN & 0b0111000000000000) >> 12)) exec.BUN(pdp8_obj);
            else if (pdp8_obj.registers.OPR === ((binOpt.BSA & 0b0111000000000000) >> 12)) exec.BSA(pdp8_obj);
            else if (pdp8_obj.registers.OPR === ((binOpt.ISZ & 0b0111000000000000) >> 12)) exec.ISZ(pdp8_obj);
        }
    }
    
    const interrupt = (pdp8_obj) => {
        if (pdp8_obj.registers.MBR === binOpt.INP) exec.INP(pdp8_obj);
        if (pdp8_obj.registers.MBR === binOpt.OUT) exec.OUT(pdp8_obj);
        if (pdp8_obj.registers.MBR === binOpt.ION) exec.ION(pdp8_obj);
        if (pdp8_obj.registers.MBR === binOpt.IOF) exec.IOF(pdp8_obj);
    }
    
    class PDP8 {
        constructor() {
            this.text = "";
            this.tokens = [];
            this.ram = new Map();
            this.status = {
                start_add: 0,
                clock: 0,
                current_add_cmd: -1,
                cycle: "FETCH"
            }
            this.IO = {
                screen: "",
                inp_buff: -1,
                wait: false
            }
            this.code_ref = new Map();
            this.registers = {
                PC: 0,
                MAR: 0,
                MBR: 0,
                OPR: 0,
                I: 0,
                E: 0,
                AC: 0
            }
            this.ctrlUnit = {
                S: false,
                F: 0,
                R: 0,
                INT: true
            }
        }
        
        start() {
            this.ctrlUnit.S = true;
            return this;
        }
        
        stop() {
            this.ctrlUnit.S = false;
            return this;
        }
        
        step() {
            if (this.ctrlUnit.S) {                
                //console.log("STEP", this.ctrlUnit.F, this.ctrlUnit.R, this.status.clock)
                
                // ----- FETCH -----
                if (this.ctrlUnit.F === 0 && this.ctrlUnit.R === 0) {
                    fetch(this);
                }
                // ----- INDIRECT -----
                else if (this.ctrlUnit.F === 0 && this.ctrlUnit.R === 1) {
                    indirect(this);
                }
                // ----- EXECUTE -----
                else if (this.ctrlUnit.F === 1 && this.ctrlUnit.R === 0) {
                    execute(this);
                }
                // ----- INTERRUPT -----
                else if (this.ctrlUnit.F === 1 && this.ctrlUnit.R === 1) {
                    interrupt(this);
                }
                
                if (this.ctrlUnit.F === 0 && this.ctrlUnit.R === 0) {
                    this.status.cycle = "FETCH"
                }
                // ----- INDIRECT -----
                else if (this.ctrlUnit.F === 0 && this.ctrlUnit.R === 1) {
                    this.status.cycle = "INDIRECT"
                }
                // ----- EXECUTE -----
                else if (this.ctrlUnit.F === 1 && this.ctrlUnit.R === 0) {
                    this.status.cycle = "EXECUTE"
                }
                // ----- INTERRUPT -----
                else if (this.ctrlUnit.F === 1 && this.ctrlUnit.R === 1) {
                    this.status.cycle = "INTERRUPT"
                }
                
                this.status.clock = (this.status.clock + 1) % 4;
            }
            return this;
        }
        
        next() {
            let cur_add = this.status.current_add_cmd;
            
            if (cur_add === -1) {
                this.step();
                cur_add = this.status.current_add_cmd;
            }
            
            while (this.status.current_add_cmd === cur_add && this.ctrlUnit.S) {
                this.step();
                if (this.IO.wait) break;
            }

            return this;
        }
        
        reset() {
            this.registers = {
                PC: this.status.start_add,
                MAR: 0,
                MBR: 0,
                OPR: 0,
                I: 0,
                E: 0,
                AC: 0
            }
            this.ctrlUnit = {
                S: false,
                F: 0,
                R: 0,
                INT: true
            }
            this.IO = {
                screen: "",
                inp_buff: -1,
                wait: false
            }
            this.status.clocl = 0;
            this.status.current_add_cmd = this.status.start_add;
            this.status.cycle = "FETCH";
            return this;
        }
        
        explain(binCode) {
            let res = {};
            res.title = binCode[0] + " | ";
            res.title += binCode.slice(1, 4) + " | ";
            res.title += binCode.slice(4);
            
            res.content = "";
            
            let tmp = "";
            let dec_val = parseInt(binCode, 2);
            for (var key in binOpt) {
                if (dec_val === binOpt[key]) {
                    tmp = key;
                    break;
                }
                else if ((dec_val & 0b0111000000000000) === binOpt[key]) {
                    tmp = key;
                    break;
                }
            }
            
            res.content += "Opcode: " + tmp + "\n";
            res.content += "Addr(Hex): 0x" + (dec_val & 0b0000111111111111).toString(16) + "\n";
            if (binCode[0] !== '0') {
                dec_val = parseInt(binCode, 2) - Math.pow(2, 16);
            }
            res.content += "Dec Val(compl 2): " + dec_val.toString() + "\n";
            res.content += "Hex Val: " + parseInt(binCode, 2).toString(16) + "\n";
            
            return res;
        }
        
        getTokens() {
            this.tokens = [];
            let tmp = '';
            let cur_type = null;

            for(let char of this.text) {
                if (checkType(char) === types.BLANK) {
                    if (tmp.length !== 0) {
                        this.tokens.push(new Token(cur_type, tmp));   
                    }   
                    tmp = '';
                    cur_type = null;
                }
                else if (checkType(char) === types.NEWLINE) {
                            if (tmp.length !== 0) {
                                this.tokens.push(new Token(cur_type, tmp));   
                            }
                            this.tokens.push(new Token(checkType(char), char)); 
                            tmp = '';
                            cur_type = null;
                }
                else if (checkType(char) === types.PUNCT &&
                         cur_type !== types.PUNCT) {
                            if (tmp.length !== 0) {
                                this.tokens.push(new Token(cur_type, tmp));   
                            }
                            tmp = char;
                            cur_type = checkType(tmp);
                }
                else if (checkType(char) !== types.BLANK) {
                    tmp += char;
                    cur_type = checkType(tmp);
                }
            }
            // Last token
            if (cur_type !== null) {
                this.tokens.push(new Token(cur_type, tmp));
            }
            
            return this;
        }
        
        setText(text) {
            if (typeof text === 'string') {
                this.text = text;
                if (this.text.charAt(this.text.length - 1) !== '\n') {
                        this.text += "\n";
                }
            }   
            else
                this.text = "";
            
            return this;
        }
        
        getRam() {
            let tmp = "";
            let counter = 0;
            for (var value of this.ram.values()) {
                tmp += `${to_base_2(value, 16)}${(counter < this.ram.size - 1) ? '\n' : ''}`;
                counter++;
            }
            return tmp;
        }
        
        getRegisters() {
            let regs = {};

            regs.PC = to_base_2(this.registers.PC, 12);
            regs.MBR = to_base_2(this.registers.MBR, 16);
            regs.AC = to_base_2(this.registers.AC, 16);
            regs.AC_INT = this.registers.AC;
            regs.AC_HEX = this.registers.AC.toString(16);
            regs.MAR = to_base_2(this.registers.MAR, 12);
            regs.OPR = to_base_2(this.registers.OPR, 3);
            regs.I = to_base_2(this.registers.I, 1);
            regs.E = to_base_2(this.registers.E, 1);

            return regs;
        }
        
        getSourceLine(ramPos) {
            let real_addr = ramPos + this.status.start_add;
            for (var key of this.code_ref.keys()) {
                if (this.code_ref.get(key) === real_addr) {
                    return key;
                }
            }
        }

        getCodeRef() {
            let references = {
                PC: {
                    ram: -1,
                    source: -1
                },
                MAR: {
                    ram: -1,
                    source: -1
                },
                CUR_CMD: {
                    ram: -1,
                    source: -1
                }
            };
            
            for (var key of this.code_ref.keys()) {
                if (this.code_ref.get(key) === this.registers.PC) {
                    references.PC.source = key;
                    references.PC.ram = this.code_ref.get(key) - this.status.start_add + 1;
                }
                if (this.code_ref.get(key) === this.registers.MAR) {
                    references.MAR.source = key;
                    references.MAR.ram = this.code_ref.get(key) - this.status.start_add + 1;
                }
                if (this.code_ref.get(key) === this.status.current_add_cmd) {
                    references.CUR_CMD.source = key;
                    references.CUR_CMD.ram = this.code_ref.get(key) - this.status.start_add + 1;
                }
            }
            
            return references;
        }

        compile(text) {
            this.setText(text)
                .getTokens();
            
            this.ram.clear();
            this.code_ref.clear();
            this.status.start_add = 0;
            this.status.current_add_cmd = -1;
            
            let cur_add = this.status.start_add;
            let cur_state = states.NONE;
            let tmp_bin = 0b0;
            let lineNum = 1;
            let index = -1;
            
            let flags = {
                ORG: false,
                END: false,
                HLT: false
            }
            
            let errors = {};
            let labels = {};
            let to_resolve = {};
            
            let addInMem = (binary) => {
                this.ram.set(cur_add, binary);
                this.code_ref.set(lineNum, cur_add);
                cur_add++;
            }
            
            //console.log(this.tokens);

            while (index < this.tokens.length - 1) {
                index++;
                let cur_tok = this.tokens[index];
                //console.log(cur_state, cur_tok.type, cur_tok.val);
                //console.log(this.code_ref)
                //console.log(this.status)
               
                // ----- NONE -----
                if (cur_state === states.NONE) {
                    // ----- NEWLINE -----
                    if (cur_tok.type === types.NEWLINE) {
                        cur_state = states.NONE;
                        lineNum++;
                    }
                    // ----- PUNCT -----
                    else if (cur_tok.type === types.PUNCT) {
                        if (cur_tok.val === '/*') {
                            cur_state = states.COMMENT_MULTILNE;
                        }
                        else if (cur_tok.val === '//') {
                            cur_state = states.COMMENT_INLINE;
                        }
                        else {
                            errors[`Error (${lineNum})`] = "Wrong command!";
                            cur_state = states.ERROR;
                        }
                    }
                    // ----- HEX_NUM -----
                    else if ((cur_tok.type === types.HEX_NUM || 
                             cur_tok.type === types.NUMBER) &&
                             cur_tok.val.length === 4) {
                        let tmp = parseInt(cur_tok.val, 16);
                        if (tmp >= 0) {
                            addInMem(tmp);
                            cur_state = states.HEX_NUM;
                        }
                        else {
                            errors[`Error (${lineNum})`] = "Hex value can't be negative!";
                            cur_state = states.ERROR;
                        }
                    }
                    // ----- WORD -----
                    else if (cur_tok.type === types.WORD) {
                        if (this.tokens[index+1] !== undefined && 
                            this.tokens[index+1].type === types.PUNCT &&
                            this.tokens[index+1].val === ',') {
                                labels[cur_tok.val] = cur_add;
                                cur_state = states.LABEL;
                        }
                        // ----- ORG -----
                        else if (cur_tok.val.toLowerCase() === 'org') {
                            flags.ORG = true;
                            cur_state = states.ORG;
                        }
                        // ----- END -----
                        else if (cur_tok.val.toLowerCase() === 'end') {
                            flags.END = true;
                            cur_state = states.END_CMD;
                        }
                        // ----- HLT -----
                        else if (cur_tok.val.toLowerCase() === 'hlt') {
                            addInMem(binOpt[cur_tok.val.toUpperCase()]);
                            flags.HLT = true;
                            cur_state = states.END_CMD;
                        }
                        // ----- Register Reference Istructions -----
                        else if (cur_tok.val.toLowerCase() === 'cla' ||
                                 cur_tok.val.toLowerCase() === 'cle' ||
                                 cur_tok.val.toLowerCase() === 'cma' ||
                                 cur_tok.val.toLowerCase() === 'cme' ||
                                 cur_tok.val.toLowerCase() === 'cir' ||
                                 cur_tok.val.toLowerCase() === 'cil' ||
                                 cur_tok.val.toLowerCase() === 'inc' ||
                                 cur_tok.val.toLowerCase() === 'spa' ||
                                 cur_tok.val.toLowerCase() === 'sza' ||
                                 cur_tok.val.toLowerCase() === 'sna' ||
                                 cur_tok.val.toLowerCase() === 'sze') {
                                    addInMem(binOpt[cur_tok.val.toUpperCase()]);
                                    cur_state = states.END_CMD;
                        }
                        // ----- I/O Istructions -----
                        else if (cur_tok.val.toLowerCase() === 'inp' ||
                                cur_tok.val.toLowerCase() === 'out' ||
                                cur_tok.val.toLowerCase() === 'ion' ||
                                cur_tok.val.toLowerCase() === 'iof') {
                                    addInMem(binOpt[cur_tok.val.toUpperCase()]);
                                    cur_state = states.END_CMD;
                        }
                        // ----- Memory Reference Istructions -----
                        else if (cur_tok.val.toLowerCase() === 'lda' ||
                                cur_tok.val.toLowerCase() === 'sta' ||
                                cur_tok.val.toLowerCase() === 'and' ||
                                cur_tok.val.toLowerCase() === 'bun' ||
                                cur_tok.val.toLowerCase() === 'bsa' ||
                                cur_tok.val.toLowerCase() === 'isz') {
                                    tmp_bin = binOpt[cur_tok.val.toUpperCase()];
                                    cur_state = states.ADDRESS;
                        }
                        // ----- HEX -----
                        else if (cur_tok.val.toLowerCase() === 'hex') {
                            cur_state = states.HEX_VAL;
                        }
                        else {
                            to_resolve[cur_add] = cur_tok.val;
                            addInMem(0b0);
                            cur_state = states.END_CMD;
                        }
                    }
                    /* 
                     * ----- DEC -----
                     * ----- ADD -----
                     */
                    else if (cur_tok.type === types.HEX_NUM) {
                        if (cur_tok.val.toLowerCase() === 'dec') {
                            cur_state = states.DEC_VAL;
                        }
                        else if (cur_tok.val.toLowerCase() === 'add') {
                            tmp_bin = binOpt[cur_tok.val.toUpperCase()];
                            cur_state = states.ADDRESS;
                        }
                        else if (this.tokens[index+1] !== undefined && 
                            this.tokens[index+1].type === types.PUNCT &&
                            this.tokens[index+1].val === ',') {
                                labels[cur_tok.val] = cur_add;
                                cur_state = states.LABEL;
                        }
                        else {
                            errors[`Error (${lineNum})`] = "Bad command or label!";
                            cur_state = states.ERROR;
                        }
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Bad command!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- COMMENT_MULTILNE -----
                else if (cur_state === states.COMMENT_MULTILNE) {
                    if (cur_tok.type === types.PUNCT && cur_tok.val === "*/") {
                        cur_state = states.NONE;
                    }
                    else if (cur_tok.type === types.NEWLINE) {
                        lineNum++;
                    }
                }
                // ----- COMMENT_INLINE -----
                else if (cur_state === states.COMMENT_INLINE) {
                    if (cur_tok.type === types.NEWLINE) {
                        lineNum++;
                        cur_state = states.NONE;
                    }
                }
                // ----- ADDRESS -----
                else if (cur_state === states.ADDRESS) {
                    if (cur_tok.type === types.HEX_NUM ||
                        cur_tok.type === types.NUMBER) {
                            // ----- ADDRESS -> DEC -----
                            if (cur_tok.val.toLowerCase() === 'dec' &&
                                this.tokens[index+1].type === types.NUMBER) {
                                    cur_state = states.ADDR_DEC_VAL;        
                            }
                            // ----- ADDRESS -> HEX NUM -----
                            else if (cur_tok.val.length === 4) {
                                let tmp = parseInt(cur_tok.val, 16);
                                tmp_bin |= tmp
                                cur_state = states.INDIRECT;
                            }
                            // ----- ADDRESS -> LABEL -----
                            else {
                                if (!labels.hasOwnProperty(cur_tok.val)) {
                                    to_resolve[cur_add] = cur_tok.val;
                                    cur_state = states.INDIRECT;
                                }
                                else {
                                    tmp_bin |= labels[cur_tok.val];
                                    cur_state = states.INDIRECT;
                                }
                            }
                    }
                    else if (cur_tok.type === types.WORD) {
                        // ----- ADDRESS -> HEX -----
                        if (cur_tok.val.toLowerCase() === 'hex') {
                            cur_state = states.ADDR_HEX_VAL;
                        }
                        // ----- ADDRESS -> LABEL -----
                        else {
                            if (!labels.hasOwnProperty(cur_tok.val)) {
                                to_resolve[cur_add] = cur_tok.val;
                                cur_state = states.INDIRECT;
                            }
                            else {
                                tmp_bin |= labels[cur_tok.val];
                                cur_state = states.INDIRECT;
                            }
                        }
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong address!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- HEX_NUM -----
                else if (cur_state === states.HEX_NUM) {
                    if (cur_tok.type === types.NEWLINE) {
                        lineNum++;
                        cur_state = states.NONE;
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong HEX command!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- HEX_VAL -----
                else if (cur_state === states.HEX_VAL) {
                    if (cur_tok.type === types.HEX_NUM ||
                        cur_tok.type === types.NUMBER) {
                            let tmp = parseInt(cur_tok.val, 16);
                            if (tmp >= 0) {
                                addInMem(tmp);
                                cur_state = states.END_CMD;
                            }
                            else {
                                errors[`Error (${lineNum})`] = "Hex value can't be negative!";
                                cur_state = states.ERROR;
                            }
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong HEX value!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- DEC_VAL -----
                else if (cur_state === states.DEC_VAL) {
                    if (cur_tok.type === types.NUMBER) {
                        addInMem(parseInt(cur_tok.val));
                        cur_state = states.END_CMD;
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong DEC value!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- ADDR_HEX_VAL -----
                else if (cur_state === states.ADDR_HEX_VAL) {
                    if (cur_tok.type === types.HEX_NUM) {
                        let tmp = parseInt(cur_tok.val, 16);
                        if (tmp >= 0) {
                            addInMem(tmp);
                            cur_state = states.INDIRECT;
                        }
                        else {
                            errors[`Error (${lineNum})`] = "Hex address can't be negative!";
                            cur_state = states.ERROR;
                        }
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong HEX value address!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- ADDR_DEC_VAL -----
                else if (cur_state === states.ADDR_DEC_VAL) {
                    if (cur_tok.type === types.NUMBER) {
                        addInMem(parseInt(cur_tok.val));
                        cur_state = states.INDIRECT;
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong DEC value address!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- LABEL -----
                else if (cur_state === states.LABEL) {
                    if (cur_tok.type === types.PUNCT &&
                        cur_tok.val === ",") {
                            cur_state = states.NONE;
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong label declaration!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- ORG -----
                else if (cur_state === states.ORG) {
                    if ((cur_tok.type === types.HEX_NUM ||
                        cur_tok.type === types.NUMBER) &&
                        parseInt(cur_tok.val, 16) >= 0) {
                            this.status.start_add = parseInt(cur_tok.val, 16);
                            cur_add = parseInt(cur_tok.val, 16);
                            cur_state = states.END_CMD;
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong ORG address!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- INDIRECT -----
                else if (cur_state === states.INDIRECT) {
                    if (cur_tok.type === types.NEWLINE) {
                        addInMem(tmp_bin);
                        lineNum++;
                        cur_state = states.NONE;
                    }
                    else if (cur_tok.type === types.WORD &&
                             cur_tok.val.toLowerCase() === 'i') {
                                tmp_bin |= 0b1000000000000000;
                                addInMem(tmp_bin);
                                cur_state = states.END_CMD;
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong indirect address!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- END_CMD -----
                else if (cur_state === states.END_CMD) {
                    if (cur_tok.type === types.NEWLINE) {
                        lineNum++;
                        cur_state = states.NONE;
                    }
                    else {
                        errors[`Error (${lineNum})`] = "Wrong command!";
                        cur_state = states.ERROR;
                    }
                }
                // ----- ERROR -----
                else if (cur_state === states.ERROR) {
                    if (cur_tok.type === types.NEWLINE) {
                        lineNum++;
                        cur_state = states.NONE;
                    }
                }
            }
            
            //console.log(to_resolve);
            //console.log(labels);
            
            for (let mem_add in to_resolve) {
                this.ram.set(+mem_add, this.ram.get(+mem_add) | labels[to_resolve[mem_add]]);
                if (labels.hasOwnProperty(to_resolve[mem_add])) {
                    delete to_resolve[mem_add];    
                }
            }
            
            if (Object.keys(to_resolve).length !== 0) {
                for (let mem_add in to_resolve) {
                    errors[`Error (LABEL)`] = `Missing LABEL '${to_resolve[mem_add]}'!`;
                }
            } 

            if (flags.ORG && !flags.END) {
                errors[`Error (ORG)`] = "Missing END command!";
            }
            if (!flags.ORG && flags.END) {
                errors[`Error (END)`] = "Missing ORG command!";
            }
            if (!flags.ORG && !flags.END) {
                errors[`Warning (ORG)`] = "ORG and END commands not found!";
            }
            if (!flags.HLT) {
                errors[`Warning (HLT)`] = "HTL command not found!";
            }
            
            //console.log(this.ram);
            //console.log(this.code_ref);
            
            this.reset();

            return errors;
        }
    } 
    
    // Like in other libs
    var root = typeof self == 'object' && self.self === self && self ||
               typeof global == 'object' && global.global === global && global ||
               this;

    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
        exports = module.exports = PDP8;
        }
        exports.PDP8 = PDP8;
    } else {
        root.PDP8 = PDP8;
    }
})();