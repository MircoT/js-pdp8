'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    var Token = function Token(type, val) {
        _classCallCheck(this, Token);

        this.type = type;
        this.val = val;
    };

    var types = {
        NUMBER: Symbol('number'),
        HEX_NUM: Symbol('hex_number'),
        WORD: Symbol('word'),
        PUNCT: Symbol('punct'),
        BLANK: Symbol('blank'),
        NEWLINE: Symbol('newLine')
    };

    var states = {
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
    };

    var binOpt = {
        AND: 0,
        ADD: 4096,
        LDA: 8192,
        STA: 12288,
        BUN: 16384,
        BSA: 20480,
        ISZ: 24576,
        CLA: 30720,
        CLE: 29696,
        CMA: 29184,
        CME: 28928,
        CIR: 28800,
        CIL: 28736,
        INC: 28704,
        SPA: 28688,
        SNA: 28680,
        SZA: 28676,
        SZE: 28674,
        HLT: 28673,
        INP: 63488,
        OUT: 62464,
        ION: 61568,
        IOF: 61504
    };

    var isWord = function isWord(buff) {
        var word = true;
        if (buff.charCodeAt(0) >= 48 && buff.charCodeAt(0) <= 57) {
            return false;
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = buff[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var c = _step.value;

                var code = c.charCodeAt(0);
                word &= code >= 65 && code <= 90 || // A-Z
                code >= 97 && code <= 122 || // a-z
                code === 95 || code >= 48 && code <= 57 // 0-9
                ? true : false; // _
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return word ? types.WORD : false;
    };

    var isNumber = function isNumber(buff) {
        if (buff[0] === '-') buff = buff.slice(1);
        var number = true;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = buff[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var c = _step2.value;

                var code = c.charCodeAt(0);
                number &= code >= 48 && code <= 57 ? true : false; // 0-9
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return number ? types.NUMBER : false;
    };

    var isHex = function isHex(buff) {
        var number = true;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = buff[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var c = _step3.value;

                var code = c.charCodeAt(0);
                number &= code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102 ? true : false; // 0-9
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return number ? types.HEX_NUM : false;
    };

    var isPunct = function isPunct(buff) {
        var punct = true;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = buff[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var c = _step4.value;

                var code = c.charCodeAt(0);
                punct &= code >= 33 && code <= 47 || code >= 58 && code <= 63 || code >= 91 && code <= 94 || code >= 123 && code <= 126 || code === 96 ? true : false;
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        return punct ? types.PUNCT : false;
    };

    var isBlank = function isBlank(buff) {
        var blank = true;
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = buff[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var c = _step5.value;

                blank &= c === ' ' || c === '' || c === '\t' ? true : false;
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }

        return blank ? types.BLANK : false;
    };

    var isNewLine = function isNewLine(c) {
        return c === '\n' ? types.NEWLINE : false;
    };

    var checkType = function checkType(buff) {
        return isNumber(buff) || isHex(buff) || isWord(buff) || isPunct(buff) || isBlank(buff) || isNewLine(buff);
    };

    var to_base_2 = function to_base_2(num, num_bit) {
        // Mask to have complement 2 and then conversion
        var mask = Math.pow(2, num_bit) - 1;
        var str = (num & mask).toString(2);
        while (str.length < num_bit) {
            str = '0' + str;
        }
        return str;
    };

    var exec = {
        CLA: function CLA(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: AC <- 0 , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.AC = 0;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "AC <- 0 , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        CLE: function CLE(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E <- 0 , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.E = 0;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "E <- 0 , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        CMA: function CMA(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: AC <- AC' , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.AC = ~pdp8_obj.registers.AC & 65535;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "AC <- AC' , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        CME: function CME(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E <- E' , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.registers.E = ~pdp8_obj.registers.E & 1;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "E <- E' , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        CIR: function CIR(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E-AC <- bit1 - E - (AC \ bit1) , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                var tmp = pdp8_obj.registers.E << 15;
                pdp8_obj.registers.E = pdp8_obj.registers.AC & 1;
                pdp8_obj.registers.AC = pdp8_obj.registers.AC >>> 1 | tmp;
                pdp8_obj.registers.AC = pdp8_obj.registers.AC & 65535;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "E-AC <- bit1 - E - (AC \ bit1) , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        CIL: function CIL(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: E-AC <- AC-E , F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                var tmp = pdp8_obj.registers.AC;
                pdp8_obj.registers.AC = pdp8_obj.registers.AC << 1 | pdp8_obj.registers.E;
                pdp8_obj.registers.AC = pdp8_obj.registers.AC & 65535;
                pdp8_obj.registers.E = (tmp & 32768) >>> 15;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "E-AC <- AC-E , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        INC: function INC(pdp8_obj) {
            /* NOP
             * NOP
             * NOP
             * E-AC <- E-AC + 1 ,F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                var tmp = pdp8_obj.registers.AC + 1;
                pdp8_obj.registers.E = tmp & 65536;
                pdp8_obj.registers.AC = tmp & 65535;
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "E-AC <- E-AC + 1 ,F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        SPA: function SPA(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: if(AC>0) : 
             *      PC <- PC+1
             *    F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                var tmp_cmpl_2 = 0;
                if (pdp8_obj.registers.AC > 32767) {
                    tmp_cmpl_2 = pdp8_obj.registers.AC - Math.pow(2, 16);
                } else {
                    tmp_cmpl_2 = pdp8_obj.registers.AC;
                }
                if (tmp_cmpl_2 > 0) {
                    pdp8_obj.registers.PC++;
                }
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "PC <- PC+1 if(AC>0) , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        SNA: function SNA(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: if(AC<0) : 
             *      PC <- PC+1
             *    F <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                var tmp_cmpl_2 = 0;
                if (pdp8_obj.registers.AC > 32767) {
                    tmp_cmpl_2 = pdp8_obj.registers.AC - Math.pow(2, 16);
                } else {
                    tmp_cmpl_2 = pdp8_obj.registers.AC;
                }
                if (tmp_cmpl_2 < 0) {
                    pdp8_obj.registers.PC++;
                }
                pdp8_obj.ctrlUnit.F = 0;
                pdp8_obj.status.last_instr_exec = "PC <- PC+1 if(AC<0) , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        SZA: function SZA(pdp8_obj) {
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
                pdp8_obj.status.last_instr_exec = "PC <- PC+1 if(AC==0) , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        SZE: function SZE(pdp8_obj) {
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
                pdp8_obj.status.last_instr_exec = "PC <- PC+1 if(E==0) , F <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        HLT: function HLT(pdp8_obj) {
            /*
             * 0: NOP
             * 1: NOP
             * 2: NOP
             * 3: S <- 0
             */
            if (pdp8_obj.status.clock === 3) {
                pdp8_obj.ctrlUnit.S = false;
                pdp8_obj.status.last_instr_exec = "S <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        AND: function AND(pdp8_obj) {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 4095;
                pdp8_obj.status.last_instr_exec = "MAR <- MBR(AD)";
            }
            // MBR <- M
            else if (pdp8_obj.status.clock === 1) {
                    pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
                    pdp8_obj.status.last_instr_exec = "MBR <- M";
                }
                // AC <- AC AND MBR
                else if (pdp8_obj.status.clock === 2) {
                        pdp8_obj.registers.AC &= pdp8_obj.registers.MBR;
                        pdp8_obj.status.last_instr_exec = "AC <- AC AND MBR";
                    }
                    // F <- 0
                    else if (pdp8_obj.status.clock === 3) {
                            pdp8_obj.ctrlUnit.F = 0;
                            pdp8_obj.status.last_instr_exec = "F <- 0";
                        }
        },
        ADD: function ADD(pdp8_obj) {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 4095;
                pdp8_obj.status.last_instr_exec = "MAR <- MBR(AD)";
            }
            // MBR <- M
            else if (pdp8_obj.status.clock === 1) {
                    pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
                    pdp8_obj.status.last_instr_exec = "MBR <- M";
                }
                // E-AC <- AC + MBR
                else if (pdp8_obj.status.clock === 2) {
                        var tmp = pdp8_obj.registers.AC + pdp8_obj.registers.MBR & 65535;
                        if (tmp > 32767) {
                            tmp = tmp - Math.pow(2, 16);
                        }

                        pdp8_obj.registers.E = 0;
                        var mask = 32768;

                        if ((pdp8_obj.registers.AC & mask) >> 15 === 1 && (pdp8_obj.registers.MBR & mask) >> 15 === 1 && (tmp & mask) >> 15 === 0 || (pdp8_obj.registers.AC & mask) >> 15 === 0 && (pdp8_obj.registers.MBR & mask) >> 15 === 0 && (tmp & mask) >> 15 === 1) {
                            pdp8_obj.registers.E = 1;
                        }

                        pdp8_obj.registers.AC = tmp;
                        pdp8_obj.status.last_instr_exec = "E-AC <- AC + MBR";
                    }
                    // F <- 0
                    else if (pdp8_obj.status.clock === 3) {
                            pdp8_obj.ctrlUnit.F = 0;
                            pdp8_obj.status.last_instr_exec = "F <- 0";
                        }
        },
        LDA: function LDA(pdp8_obj) {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 4095;
                pdp8_obj.status.last_instr_exec = "MAR <- MBR(AD)";
            }
            // MBR <- M, AC <- 0
            else if (pdp8_obj.status.clock === 1) {
                    pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
                    pdp8_obj.registers.AC = 0;
                    pdp8_obj.status.last_instr_exec = "MBR <- M, AC <- 0";
                }
                // AC <- AC + MBR
                else if (pdp8_obj.status.clock === 2) {
                        pdp8_obj.registers.AC |= pdp8_obj.registers.MBR;
                        pdp8_obj.status.last_instr_exec = "AC <- AC + MBR";
                    }
                    // F <- 0
                    else if (pdp8_obj.status.clock === 3) {
                            pdp8_obj.ctrlUnit.F = 0;
                            pdp8_obj.status.last_instr_exec = "F <- 0";
                        }
        },
        STA: function STA(pdp8_obj) {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 4095;
                pdp8_obj.status.last_instr_exec = "MAR <- MBR(AD)";
            }
            // MBR <- AC
            else if (pdp8_obj.status.clock === 1) {
                    pdp8_obj.registers.MBR = pdp8_obj.registers.AC;
                    pdp8_obj.status.last_instr_exec = "MBR <- AC";
                }
                // M <- MBR
                else if (pdp8_obj.status.clock === 2) {
                        pdp8_obj.ram.set(pdp8_obj.registers.MAR, pdp8_obj.registers.MBR);
                        pdp8_obj.status.last_instr_exec = "M <- MBR";
                    }
                    // F <- 0
                    else if (pdp8_obj.status.clock === 3) {
                            pdp8_obj.ctrlUnit.F = 0;
                            pdp8_obj.status.last_instr_exec = "F <- 0";
                        }
        },
        BUN: function BUN(pdp8_obj) {
            // PC <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.PC = pdp8_obj.registers.MBR & 4095;
                pdp8_obj.status.last_instr_exec = "PC <- MBR(AD)";
            }
            // NOP
            // NOP
            // F <- 0
            else if (pdp8_obj.status.clock === 3) {
                    pdp8_obj.ctrlUnit.F = 0;
                    pdp8_obj.status.last_instr_exec = "F <- 0";
                } else {
                    pdp8_obj.status.last_instr_exec = "NOP";
                }
        },
        BSA: function BSA(pdp8_obj) {
            // MAR <- MBR(AD) , MBR(AD) <- PC
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 4095;
                pdp8_obj.registers.MBR &= 0;
                pdp8_obj.registers.MBR |= pdp8_obj.registers.PC;
                pdp8_obj.status.last_instr_exec = "MAR <- MBR(AD) , MBR <- 0, MBR(AD) <- PC";
            }
            // M <- MBR
            else if (pdp8_obj.status.clock === 1) {
                    pdp8_obj.ram.set(pdp8_obj.registers.MAR, pdp8_obj.registers.MBR);
                    pdp8_obj.status.last_instr_exec = "M <- MBR";
                }
                // PC <- MAR+1
                else if (pdp8_obj.status.clock === 2) {
                        pdp8_obj.registers.PC = pdp8_obj.registers.MAR + 1;
                        pdp8_obj.status.last_instr_exec = "PC <- MAR+1";
                    }
                    // F <- 0
                    else if (pdp8_obj.status.clock === 3) {
                            pdp8_obj.ctrlUnit.F = 0;
                            pdp8_obj.status.last_instr_exec = "F <- 0";
                        }
        },
        ISZ: function ISZ(pdp8_obj) {
            // MAR <- MBR(AD)
            if (pdp8_obj.status.clock === 0) {
                pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 4095;
                pdp8_obj.status.last_instr_exec = "MAR <- MBR(AD)";
            }
            // MBR <- M
            else if (pdp8_obj.status.clock === 1) {
                    pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
                    pdp8_obj.status.last_instr_exec = "MBR <- M";
                }
                // MBR <- MBR + 1
                else if (pdp8_obj.status.clock === 2) {
                        pdp8_obj.registers.MBR++;
                        pdp8_obj.registers.MBR &= 65535;
                        pdp8_obj.status.last_instr_exec = "MBR <- MBR + 1";
                    }
                    /* M <- MBR , 
                     * if (MBR == 0) PC <- PC + 1
                     * F <- 0
                     */
                    else if (pdp8_obj.status.clock === 3) {
                            pdp8_obj.ram.set(pdp8_obj.registers.MAR, pdp8_obj.registers.MBR);
                            if (pdp8_obj.registers.MBR === 0) {
                                pdp8_obj.registers.PC++;
                            }
                            pdp8_obj.ctrlUnit.F = 0;
                            pdp8_obj.status.last_instr_exec = "M <- MBR , PC <- PC+1 if(MBR==0) , F <- 0";
                        }
        },
        ION: function ION(pdp8_obj) {
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
                pdp8_obj.status.last_instr_exec = "INT <- true , F <- 0 , R <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        IOF: function IOF(pdp8_obj) {
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
                pdp8_obj.status.last_instr_exec = "INT <- true , F <- 0 , R <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        INP: function INP(pdp8_obj) {
            /*
             * NOP
             * NOP
             * NOP
             * AC <- input_buf , F <- 0 , R <- 0
             */
            if (pdp8_obj.status.clock === 2) {
                if (pdp8_obj.ctrlUnit.INT) {
                    pdp8_obj.IO.wait = true;
                    pdp8_obj.status.last_instr_exec = "wait for input...";
                }
            } else if (pdp8_obj.status.clock === 3) {
                if (pdp8_obj.ctrlUnit.INT) {
                    if (pdp8_obj.IO.inp_buff !== -1) {
                        pdp8_obj.registers.AC = pdp8_obj.IO.inp_buff;
                        pdp8_obj.ctrlUnit.F = 0;
                        pdp8_obj.ctrlUnit.R = 0;
                        pdp8_obj.IO.inp_buff = -1;
                    }
                } else {
                    pdp8_obj.ctrlUnit.F = 0;
                    pdp8_obj.ctrlUnit.R = 0;
                }
                pdp8_obj.IO.wait = false;
                pdp8_obj.status.last_instr_exec = "AC <- input_buf , F <- 0 , R <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        },
        OUT: function OUT(pdp8_obj) {
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
                pdp8_obj.status.last_instr_exec = "screen <- AC , F <- 0 , R <- 0";
            } else {
                pdp8_obj.status.last_instr_exec = "NOP";
            }
        }
    };

    var fetch = function fetch(pdp8_obj) {
        // MAR <- PC
        if (pdp8_obj.status.clock === 0) {
            pdp8_obj.registers.MAR = pdp8_obj.registers.PC;
            pdp8_obj.status.current_add_cmd = pdp8_obj.registers.MAR;
            pdp8_obj.status.last_instr_exec = "MAR <- PC";
        }
        // MBR <- M , PC <- PC+1
        else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
                pdp8_obj.registers.PC++;
                pdp8_obj.status.last_instr_exec = "MBR <- M , PC <- PC+1";
            }
            // OPR <- MBR(OP) , I <- MBR(I)
            else if (pdp8_obj.status.clock === 2) {
                    pdp8_obj.registers.OPR = (pdp8_obj.registers.MBR & 28672) >> 12;
                    pdp8_obj.registers.I = (pdp8_obj.registers.MBR & 32768) >> 15;
                    pdp8_obj.status.last_instr_exec = "OPR <- MBR(OP) , I <- MBR(I)";
                }
                /*
                 * if I == 1 && OPR != 111 => R <- 1
                 * else F <- 1
                 */
                else if (pdp8_obj.status.clock === 3) {
                        if (pdp8_obj.registers.I === 1 && pdp8_obj.registers.OPR !== 7) {
                            pdp8_obj.ctrlUnit.R = 1;
                        } else {
                            pdp8_obj.ctrlUnit.F = 1;
                        }
                        pdp8_obj.status.last_instr_exec = "if I == 1 && OPR != 111 => R <- 1 else F <- 1";
                    }
    };

    var indirect = function indirect(pdp8_obj) {
        // MAR <- MBR(AD)
        if (pdp8_obj.status.clock === 0) {
            pdp8_obj.registers.MAR = pdp8_obj.registers.MBR & 4095;
        }
        // MBR <- M
        else if (pdp8_obj.status.clock === 1) {
                pdp8_obj.registers.MBR = pdp8_obj.ram.get(pdp8_obj.registers.MAR);
            }
            // NOP
            else if (pdp8_obj.status.clock === 2) {}
                // Nothing to do... :(

                // F <- 1 , R <- 0
                else if (pdp8_obj.status.clock === 3) {
                        pdp8_obj.ctrlUnit.R = 0;
                        pdp8_obj.ctrlUnit.F = 1;
                    }
    };

    var execute = function execute(pdp8_obj) {
        if (pdp8_obj.registers.I === 1 && pdp8_obj.registers.OPR === 7) {
            pdp8_obj.ctrlUnit.R = 1;
        } else if (pdp8_obj.registers.I === 0 && pdp8_obj.registers.OPR === 7) {
            if (pdp8_obj.registers.MBR === binOpt.CLA) exec.CLA(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.CLE) exec.CLE(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.CMA) exec.CMA(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.CME) exec.CME(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.CIR) exec.CIR(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.CIL) exec.CIL(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.INC) exec.INC(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.SPA) exec.SPA(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.SNA) exec.SNA(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.SZA) exec.SZA(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.SZE) exec.SZE(pdp8_obj);else if (pdp8_obj.registers.MBR === binOpt.HLT) exec.HLT(pdp8_obj);
        } else {
            if (pdp8_obj.registers.OPR === (binOpt.AND & 28672) >> 12) exec.AND(pdp8_obj);else if (pdp8_obj.registers.OPR === (binOpt.ADD & 28672) >> 12) exec.ADD(pdp8_obj);else if (pdp8_obj.registers.OPR === (binOpt.LDA & 28672) >> 12) exec.LDA(pdp8_obj);else if (pdp8_obj.registers.OPR === (binOpt.STA & 28672) >> 12) exec.STA(pdp8_obj);else if (pdp8_obj.registers.OPR === (binOpt.BUN & 28672) >> 12) exec.BUN(pdp8_obj);else if (pdp8_obj.registers.OPR === (binOpt.BSA & 28672) >> 12) exec.BSA(pdp8_obj);else if (pdp8_obj.registers.OPR === (binOpt.ISZ & 28672) >> 12) exec.ISZ(pdp8_obj);
        }
    };

    var interrupt = function interrupt(pdp8_obj) {
        if (pdp8_obj.registers.MBR === binOpt.INP) exec.INP(pdp8_obj);
        if (pdp8_obj.registers.MBR === binOpt.OUT) exec.OUT(pdp8_obj);
        if (pdp8_obj.registers.MBR === binOpt.ION) exec.ION(pdp8_obj);
        if (pdp8_obj.registers.MBR === binOpt.IOF) exec.IOF(pdp8_obj);
    };

    var PDP8 = function () {
        function PDP8() {
            _classCallCheck(this, PDP8);

            this.text = "";
            this.tokens = [];
            this.ram = new Map();
            this.status = {
                start_add: 0,
                clock: 0,
                current_add_cmd: -1,
                cycle: "FETCH",
                last_instr_exec: "NOP"
            };
            this.IO = {
                screen: "",
                inp_buff: -1,
                wait: false
            };
            this.code_ref = new Map();
            this.registers = {
                PC: 0,
                MAR: 0,
                MBR: 0,
                OPR: 0,
                I: 0,
                E: 0,
                AC: 0
            };
            this.ctrlUnit = {
                S: false,
                F: 0,
                R: 0,
                INT: true
            };
        }

        _createClass(PDP8, [{
            key: 'start',
            value: function start() {
                this.ctrlUnit.S = true;
                return this;
            }
        }, {
            key: 'stop',
            value: function stop() {
                this.ctrlUnit.S = false;
                return this;
            }
        }, {
            key: 'step',
            value: function step() {
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
                        this.status.cycle = "FETCH";
                    }
                    // ----- INDIRECT -----
                    else if (this.ctrlUnit.F === 0 && this.ctrlUnit.R === 1) {
                            this.status.cycle = "INDIRECT";
                        }
                        // ----- EXECUTE -----
                        else if (this.ctrlUnit.F === 1 && this.ctrlUnit.R === 0) {
                                this.status.cycle = "EXECUTE";
                            }
                            // ----- INTERRUPT -----
                            else if (this.ctrlUnit.F === 1 && this.ctrlUnit.R === 1) {
                                    this.status.cycle = "INTERRUPT";
                                }

                    this.status.clock = (this.status.clock + 1) % 4;
                }
                return this;
            }
        }, {
            key: 'next',
            value: function next() {
                if (this.ctrlUnit.S) {
                    var cur_add = this.status.current_add_cmd;

                    if (cur_add === -1) {
                        this.step();
                        cur_add = this.status.current_add_cmd;
                    }

                    while (this.status.current_add_cmd === cur_add && this.ctrlUnit.S) {
                        this.step();
                        if (this.IO.wait) break;
                    }
                }

                return this;
            }
        }, {
            key: 'reset',
            value: function reset() {
                this.registers = {
                    PC: this.status.start_add,
                    MAR: 0,
                    MBR: 0,
                    OPR: 0,
                    I: 0,
                    E: 0,
                    AC: 0
                };
                this.ctrlUnit = {
                    S: false,
                    F: 0,
                    R: 0,
                    INT: true
                };
                this.IO = {
                    screen: "",
                    inp_buff: -1,
                    wait: false
                };
                this.status.clock = 0;
                this.status.current_add_cmd = this.status.start_add;
                this.status.cycle = "FETCH";
                this.status.last_instr_exec = "NOP";
                return this;
            }
        }, {
            key: 'explain',
            value: function explain(binCode) {
                var res = {};
                res.title = binCode[0] + " | ";
                res.title += binCode.slice(1, 4) + " | ";
                res.title += binCode.slice(4);

                res.content = "";

                var tmp = "";
                var dec_val = parseInt(binCode, 2);
                for (var key in binOpt) {
                    if (dec_val === binOpt[key]) {
                        tmp = key;
                        break;
                    } else if ((dec_val & 28672) === binOpt[key]) {
                        tmp = key;
                        break;
                    }
                }

                res.content += "Opcode: " + tmp + "\n";
                res.content += "Addr(Hex): 0x" + (dec_val & 4095).toString(16) + "\n";
                if (binCode[0] !== '0') {
                    dec_val = parseInt(binCode, 2) - Math.pow(2, 16);
                }
                res.content += "Dec Val(compl 2): " + dec_val.toString() + "\n";
                res.content += "Hex Val: " + parseInt(binCode, 2).toString(16) + "\n";

                return res;
            }
        }, {
            key: 'getTokens',
            value: function getTokens() {
                this.tokens = [];
                var tmp = '';
                var cur_type = null;

                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = this.text[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var char = _step6.value;

                        if (checkType(char) === types.BLANK) {
                            if (tmp.length !== 0) {
                                this.tokens.push(new Token(cur_type, tmp));
                            }
                            tmp = '';
                            cur_type = null;
                        } else if (checkType(char) === types.NEWLINE) {
                            if (tmp.length !== 0) {
                                this.tokens.push(new Token(cur_type, tmp));
                            }
                            this.tokens.push(new Token(checkType(char), char));
                            tmp = '';
                            cur_type = null;
                        } else if (checkType(char) === types.PUNCT && cur_type !== types.PUNCT) {
                            if (tmp.length !== 0) {
                                this.tokens.push(new Token(cur_type, tmp));
                            }
                            tmp = char;
                            cur_type = checkType(tmp);
                        } else if (checkType(char) !== types.BLANK) {
                            if (cur_type === types.PUNCT && checkType(char) !== types.PUNCT) {
                                this.tokens.push(new Token(cur_type, tmp));
                                tmp = char;
                                cur_type = checkType(tmp);
                            } else {
                                tmp += char;
                                cur_type = checkType(tmp);
                            }
                        }
                    }
                    // Last token
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }

                if (cur_type !== null) {
                    this.tokens.push(new Token(cur_type, tmp));
                }

                return this;
            }
        }, {
            key: 'setText',
            value: function setText(text) {
                if (typeof text === 'string') {
                    this.text = text.replace(/(\r\n|\r)/g, '\n');
                    if (this.text.charAt(this.text.length - 1) !== '\n') {
                        this.text += "\n";
                    }
                } else this.text = "";

                return this;
            }
        }, {
            key: 'getRam',
            value: function getRam() {
                var tmp = "";
                var counter = 0;
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = this.ram.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var value = _step7.value;

                        tmp += '' + to_base_2(value, 16) + (counter < this.ram.size - 1 ? '\n' : '');
                        counter++;
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
                        }
                    }
                }

                return tmp;
            }
        }, {
            key: 'getRegisters',
            value: function getRegisters() {
                var regs = {};

                regs.PC = to_base_2(this.registers.PC, 12);
                regs.MBR = to_base_2(this.registers.MBR, 16);
                regs.AC = to_base_2(this.registers.AC, 16);
                if (this.registers.AC > 32767) {
                    regs.AC_INT = this.registers.AC - Math.pow(2, 16);
                } else {
                    regs.AC_INT = this.registers.AC;
                }
                regs.AC_HEX = parseInt(regs.AC, 2).toString(16).toUpperCase();
                regs.MAR = to_base_2(this.registers.MAR, 12);
                regs.OPR = to_base_2(this.registers.OPR, 3);
                regs.I = to_base_2(this.registers.I, 1);
                regs.E = to_base_2(this.registers.E, 1);

                return regs;
            }
        }, {
            key: 'getSourceLine',
            value: function getSourceLine(ramPos) {
                var real_addr = ramPos + this.status.start_add;
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = this.code_ref.keys()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var key = _step8.value;

                        if (this.code_ref.get(key) === real_addr) {
                            return key;
                        }
                    }
                } catch (err) {
                    _didIteratorError8 = true;
                    _iteratorError8 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }
                    } finally {
                        if (_didIteratorError8) {
                            throw _iteratorError8;
                        }
                    }
                }
            }
        }, {
            key: 'getCodeRef',
            value: function getCodeRef() {
                var references = {
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

                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = this.code_ref.keys()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var key = _step9.value;

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
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }

                return references;
            }
        }, {
            key: 'compile',
            value: function compile(text) {
                this.setText(text).getTokens();

                this.ram.clear();
                this.code_ref.clear();
                this.status.start_add = 0;
                this.status.current_add_cmd = -1;

                var cur_add = this.status.start_add;
                var cur_state = states.NONE;
                var tmp_bin = 0;
                var lineNum = 1;
                var index = -1;

                var flags = {
                    ORG: false,
                    END: false,
                    HLT: false
                };

                var errors = {};
                var labels = {};
                var to_resolve = {};

                var addInMem = function addInMem(pdp8_obj, binary) {
                    pdp8_obj.ram.set(cur_add, binary);
                    pdp8_obj.code_ref.set(lineNum, cur_add);
                    cur_add++;
                };

                //console.log(this.tokens);

                while (index < this.tokens.length - 1) {
                    index++;
                    var cur_tok = this.tokens[index];
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
                                } else if (cur_tok.val === '//') {
                                    cur_state = states.COMMENT_INLINE;
                                } else {
                                    errors['Error (' + lineNum + ')'] = "Wrong command!";
                                    cur_state = states.ERROR;
                                }
                            }
                            // ----- HEX_NUM -----
                            else if ((cur_tok.type === types.HEX_NUM || cur_tok.type === types.NUMBER) && cur_tok.val.length === 4) {
                                    var tmp = parseInt(cur_tok.val, 16);
                                    if (tmp >= 0) {
                                        addInMem(this, tmp);
                                        cur_state = states.HEX_NUM;
                                    } else {
                                        errors['Error (' + lineNum + ')'] = "Hex value can't be negative!";
                                        cur_state = states.ERROR;
                                    }
                                }
                                // ----- WORD -----
                                else if (cur_tok.type === types.WORD) {
                                        if (this.tokens[index + 1] !== undefined && this.tokens[index + 1].type === types.PUNCT && this.tokens[index + 1].val === ',') {
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
                                                        addInMem(this, binOpt[cur_tok.val.toUpperCase()]);
                                                        flags.HLT = true;
                                                        cur_state = states.END_CMD;
                                                    }
                                                    // ----- Register Reference Istructions -----
                                                    else if (cur_tok.val.toLowerCase() === 'cla' || cur_tok.val.toLowerCase() === 'cle' || cur_tok.val.toLowerCase() === 'cma' || cur_tok.val.toLowerCase() === 'cme' || cur_tok.val.toLowerCase() === 'cir' || cur_tok.val.toLowerCase() === 'cil' || cur_tok.val.toLowerCase() === 'inc' || cur_tok.val.toLowerCase() === 'spa' || cur_tok.val.toLowerCase() === 'sza' || cur_tok.val.toLowerCase() === 'sna' || cur_tok.val.toLowerCase() === 'sze') {
                                                            addInMem(this, binOpt[cur_tok.val.toUpperCase()]);
                                                            cur_state = states.END_CMD;
                                                        }
                                                        // ----- I/O Istructions -----
                                                        else if (cur_tok.val.toLowerCase() === 'inp' || cur_tok.val.toLowerCase() === 'out' || cur_tok.val.toLowerCase() === 'ion' || cur_tok.val.toLowerCase() === 'iof') {
                                                                addInMem(this, binOpt[cur_tok.val.toUpperCase()]);
                                                                cur_state = states.END_CMD;
                                                            }
                                                            // ----- Memory Reference Istructions -----
                                                            else if (cur_tok.val.toLowerCase() === 'lda' || cur_tok.val.toLowerCase() === 'sta' || cur_tok.val.toLowerCase() === 'and' || cur_tok.val.toLowerCase() === 'bun' || cur_tok.val.toLowerCase() === 'bsa' || cur_tok.val.toLowerCase() === 'isz') {
                                                                    tmp_bin = binOpt[cur_tok.val.toUpperCase()];
                                                                    cur_state = states.ADDRESS;
                                                                }
                                                                // ----- HEX -----
                                                                else if (cur_tok.val.toLowerCase() === 'hex') {
                                                                        cur_state = states.HEX_VAL;
                                                                    } else {
                                                                        to_resolve[cur_add] = cur_tok.val;
                                                                        addInMem(this, 0);
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
                                            } else if (cur_tok.val.toLowerCase() === 'add') {
                                                tmp_bin = binOpt[cur_tok.val.toUpperCase()];
                                                cur_state = states.ADDRESS;
                                            } else if (this.tokens[index + 1] !== undefined && this.tokens[index + 1].type === types.PUNCT && this.tokens[index + 1].val === ',') {
                                                labels[cur_tok.val] = cur_add;
                                                cur_state = states.LABEL;
                                            } else {
                                                errors['Error (' + lineNum + ')'] = "Bad command or label!";
                                                cur_state = states.ERROR;
                                            }
                                        } else {
                                            errors['Error (' + lineNum + ')'] = "Bad command!";
                                            cur_state = states.ERROR;
                                        }
                    }
                    // ----- COMMENT_MULTILNE -----
                    else if (cur_state === states.COMMENT_MULTILNE) {
                            if (cur_tok.type === types.PUNCT && cur_tok.val === "*/") {
                                cur_state = states.NONE;
                            } else if (cur_tok.type === types.NEWLINE) {
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
                                    if (cur_tok.type === types.HEX_NUM || cur_tok.type === types.NUMBER) {
                                        // ----- ADDRESS -> DEC -----
                                        if (cur_tok.val.toLowerCase() === 'dec' && this.tokens[index + 1].type === types.NUMBER) {
                                            cur_state = states.ADDR_DEC_VAL;
                                        }
                                        // ----- ADDRESS -> HEX NUM -----
                                        else if (cur_tok.val.length === 3) {
                                                var _tmp = parseInt(cur_tok.val, 16);
                                                tmp_bin |= _tmp;
                                                cur_state = states.INDIRECT;
                                            }
                                            // ----- ADDRESS -> LABEL -----
                                            else {
                                                    if (!labels.hasOwnProperty(cur_tok.val)) {
                                                        to_resolve[cur_add] = cur_tok.val;
                                                        cur_state = states.INDIRECT;
                                                    } else {
                                                        tmp_bin |= labels[cur_tok.val];
                                                        cur_state = states.INDIRECT;
                                                    }
                                                }
                                    } else if (cur_tok.type === types.WORD) {
                                        // ----- ADDRESS -> HEX -----
                                        if (cur_tok.val.toLowerCase() === 'hex') {
                                            cur_state = states.ADDR_HEX_VAL;
                                        }
                                        // ----- ADDRESS -> LABEL -----
                                        else {
                                                if (!labels.hasOwnProperty(cur_tok.val)) {
                                                    to_resolve[cur_add] = cur_tok.val;
                                                    cur_state = states.INDIRECT;
                                                } else {
                                                    tmp_bin |= labels[cur_tok.val];
                                                    cur_state = states.INDIRECT;
                                                }
                                            }
                                    } else {
                                        errors['Error (' + lineNum + ')'] = "Wrong address!";
                                        cur_state = states.ERROR;
                                    }
                                }
                                // ----- HEX_NUM -----
                                else if (cur_state === states.HEX_NUM) {
                                        if (cur_tok.type === types.NEWLINE) {
                                            lineNum++;
                                            cur_state = states.NONE;
                                        } else {
                                            errors['Error (' + lineNum + ')'] = "Wrong HEX command!";
                                            cur_state = states.ERROR;
                                        }
                                    }
                                    // ----- HEX_VAL -----
                                    else if (cur_state === states.HEX_VAL) {
                                            if (cur_tok.type === types.HEX_NUM || cur_tok.type === types.NUMBER) {
                                                var _tmp2 = parseInt(cur_tok.val, 16);
                                                if (_tmp2 >= 0) {
                                                    addInMem(this, _tmp2);
                                                    cur_state = states.END_CMD;
                                                } else {
                                                    errors['Error (' + lineNum + ')'] = "Hex value can't be negative!";
                                                    cur_state = states.ERROR;
                                                }
                                            } else {
                                                errors['Error (' + lineNum + ')'] = "Wrong HEX value!";
                                                cur_state = states.ERROR;
                                            }
                                        }
                                        // ----- DEC_VAL -----
                                        else if (cur_state === states.DEC_VAL) {
                                                if (cur_tok.type === types.NUMBER) {
                                                    addInMem(this, parseInt(cur_tok.val));
                                                    cur_state = states.END_CMD;
                                                } else {
                                                    errors['Error (' + lineNum + ')'] = "Wrong DEC value!";
                                                    cur_state = states.ERROR;
                                                }
                                            }
                                            // ----- ADDR_HEX_VAL -----
                                            else if (cur_state === states.ADDR_HEX_VAL) {
                                                    if (cur_tok.type === types.HEX_NUM || cur_tok.type === types.NUMBER) {
                                                        var _tmp3 = parseInt(cur_tok.val, 16);
                                                        if (_tmp3 >= 0) {
                                                            addInMem(this, tmp_bin | _tmp3);
                                                            cur_state = states.END_CMD;
                                                        } else {
                                                            errors['Error (' + lineNum + ')'] = "Hex address can't be negative!";
                                                            cur_state = states.ERROR;
                                                        }
                                                    } else {
                                                        errors['Error (' + lineNum + ')'] = "Wrong HEX value address!";
                                                        cur_state = states.ERROR;
                                                    }
                                                }
                                                // ----- ADDR_DEC_VAL -----
                                                else if (cur_state === states.ADDR_DEC_VAL) {
                                                        if (cur_tok.type === types.NUMBER) {
                                                            addInMem(this, parseInt(cur_tok.val));
                                                            cur_state = states.INDIRECT;
                                                        } else {
                                                            errors['Error (' + lineNum + ')'] = "Wrong DEC value address!";
                                                            cur_state = states.ERROR;
                                                        }
                                                    }
                                                    // ----- LABEL -----
                                                    else if (cur_state === states.LABEL) {
                                                            if (cur_tok.type === types.PUNCT && cur_tok.val === ",") {
                                                                cur_state = states.NONE;
                                                            } else {
                                                                errors['Error (' + lineNum + ')'] = "Wrong label declaration!";
                                                                cur_state = states.ERROR;
                                                            }
                                                        }
                                                        // ----- ORG -----
                                                        else if (cur_state === states.ORG) {
                                                                if ((cur_tok.type === types.HEX_NUM || cur_tok.type === types.NUMBER) && parseInt(cur_tok.val, 16) >= 0) {
                                                                    this.status.start_add = parseInt(cur_tok.val, 16);
                                                                    cur_add = parseInt(cur_tok.val, 16);
                                                                    cur_state = states.END_CMD;
                                                                } else {
                                                                    errors['Error (' + lineNum + ')'] = "Wrong ORG address!";
                                                                    cur_state = states.ERROR;
                                                                }
                                                            }
                                                            // ----- INDIRECT -----
                                                            else if (cur_state === states.INDIRECT) {
                                                                    if (cur_tok.type === types.NEWLINE) {
                                                                        addInMem(this, tmp_bin);
                                                                        lineNum++;
                                                                        cur_state = states.NONE;
                                                                    } else if (cur_tok.type === types.WORD && cur_tok.val.toLowerCase() === 'i') {
                                                                        tmp_bin |= 32768;
                                                                        addInMem(this, tmp_bin);
                                                                        cur_state = states.END_CMD;
                                                                    } else if (cur_tok.type === types.PUNCT) {
                                                                        if (cur_tok.val === '/*') {
                                                                            addInMem(this, tmp_bin);
                                                                            cur_state = states.COMMENT_MULTILNE;
                                                                        } else if (cur_tok.val === '//') {
                                                                            addInMem(this, tmp_bin);
                                                                            cur_state = states.COMMENT_INLINE;
                                                                        } else {
                                                                            errors['Error (' + lineNum + ')'] = "Wrong command!";
                                                                            cur_state = states.ERROR;
                                                                        }
                                                                    } else {
                                                                        errors['Error (' + lineNum + ')'] = "Wrong indirect address!";
                                                                        cur_state = states.ERROR;
                                                                    }
                                                                }
                                                                // ----- END_CMD -----
                                                                else if (cur_state === states.END_CMD) {
                                                                        if (cur_tok.type === types.NEWLINE) {
                                                                            lineNum++;
                                                                            cur_state = states.NONE;
                                                                        } else if (cur_tok.type === types.PUNCT) {
                                                                            if (cur_tok.val === '/*') {
                                                                                cur_state = states.COMMENT_MULTILNE;
                                                                            } else if (cur_tok.val === '//') {
                                                                                cur_state = states.COMMENT_INLINE;
                                                                            } else {
                                                                                errors['Error (' + lineNum + ')'] = "Wrong command!";
                                                                                cur_state = states.ERROR;
                                                                            }
                                                                        } else {
                                                                            errors['Error (' + lineNum + ')'] = "Wrong command!";
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

                for (var mem_add in to_resolve) {
                    this.ram.set(+mem_add, this.ram.get(+mem_add) | labels[to_resolve[mem_add]]);
                    if (labels.hasOwnProperty(to_resolve[mem_add])) {
                        delete to_resolve[mem_add];
                    }
                }

                if (Object.keys(to_resolve).length !== 0) {
                    for (var _mem_add in to_resolve) {
                        errors['Error (LABEL[' + to_resolve[_mem_add] + '])'] = 'Missing LABEL reference!';
                    }
                }

                if (flags.ORG && !flags.END) {
                    errors['Error (ORG)'] = "Missing END command!";
                }
                if (!flags.ORG && flags.END) {
                    errors['Error (END)'] = "Missing ORG command!";
                }
                if (!flags.ORG && !flags.END) {
                    errors['Warning (ORG)'] = "ORG and END commands not found!";
                }
                if (!flags.HLT) {
                    errors['Warning (HLT)'] = "HTL command not found!";
                }

                //console.log(this.ram);
                //console.log(this.code_ref);

                this.reset();

                // ----- Clean if there are errors -----
                for (var label in errors) {
                    if (label.indexOf("Error") !== -1) {
                        this.ram.clear();
                        this.code_ref.clear();
                        this.status.start_add = 0;
                        this.status.current_add_cmd = -1;
                        this.reset();
                        break;
                    }
                }

                return errors;
            }
        }]);

        return PDP8;
    }();

    // Like in other libs


    var root = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self.self === self && self || (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global.global === global && global || this;

    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = PDP8;
        }
        exports.PDP8 = PDP8;
    } else {
        root.PDP8 = PDP8;
    }
})();
