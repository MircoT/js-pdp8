var assert = require('chai').assert;
var expect = require('chai').expect;
var PDP8 = require('../pdp8');
var fs = require('fs');
var path = require('path');


describe('js-pdp8', function() {
  describe('VM Behavior', function () {
    it("Sould create a Pdp8 VM", function () {
        var vm = new PDP8();
        assert.instanceOf(vm, PDP8, 'vm have to be an instance of PDP8');
    });
  });
  describe('Register Reference Istructions', function () {
    it("CLA", function () {
        var vm = new PDP8();
        vm.compile("CLA");
        assert.strictEqual(vm.getRam(), "0111100000000000", 'CLA have to be equal to 0111100000000000');
    });
    it("CLE", function () {
        var vm = new PDP8();
        vm.compile("CLE");
        assert.strictEqual(vm.getRam(), "0111010000000000", 'CLE have to be equal to 0111010000000000');
    });
    it("CMA", function () {
        var vm = new PDP8();
        vm.compile("CMA");
        assert.strictEqual(vm.getRam(), "0111001000000000", 'CMA have to be equal to 0111001000000000');
    });
    it("CME", function () {
        var vm = new PDP8();
        vm.compile("CME");
        assert.strictEqual(vm.getRam(), "0111000100000000", 'CME have to be equal to 0111000100000000');
    });
    it("CIR", function () {
        var vm = new PDP8();
        vm.compile("CIR");
        assert.strictEqual(vm.getRam(), "0111000010000000", 'CIR have to be equal to 0111000010000000');
    });
    it("CIL", function () {
        var vm = new PDP8();
        vm.compile("CIL");
        assert.strictEqual(vm.getRam(), "0111000001000000", 'CIL have to be equal to 0111000001000000');
    });
    it("INC", function () {
        var vm = new PDP8();
        vm.compile("INC");
        assert.strictEqual(vm.getRam(), "0111000000100000", 'INC have to be equal to 0111000000100000');
    });
    it("SPA", function () {
        var vm = new PDP8();
        vm.compile("SPA");
        assert.strictEqual(vm.getRam(), "0111000000010000", 'SPA have to be equal to 0111000000010000');
    });
    it("SNA", function () {
        var vm = new PDP8();
        vm.compile("SNA");
        assert.strictEqual(vm.getRam(), "0111000000001000", 'SNA have to be equal to 0111000000001000');
    });
    it("SZA", function () {
        var vm = new PDP8();
        vm.compile("SZA");
        assert.strictEqual(vm.getRam(), "0111000000000100", 'SZA have to be equal to 0111000000000100');
    });
    it("SZE", function () {
        var vm = new PDP8();
        vm.compile("SZE");
        assert.strictEqual(vm.getRam(), "0111000000000010", 'SZE have to be equal to 0111000000000010');
    });
    it("HLT", function () {
        var vm = new PDP8();
        vm.compile("HLT");
        assert.strictEqual(vm.getRam(), "0111000000000001", 'HLT have to be equal to 0111000000000001');
    });
  });
  describe('I/O Istructions', function () {
    it("INP", function () {
        var vm = new PDP8();
        vm.compile("INP");
        assert.strictEqual(vm.getRam(), "1111100000000000", 'INP have to be equal to 1111100000000000');
        
        vm.start()
          .next();
        vm.IO.inp_buff = 65;
        vm.next();
        assert.strictEqual(vm.registers.AC, 65, 'INP have to fill AC register');
    });
    it("OUT", function () {
        var vm = new PDP8();
        vm.compile("OUT");
        assert.strictEqual(vm.getRam(), "1111010000000000", 'OUT have to be equal to 1111010000000000');
        
        vm.start();
        vm.registers.AC = 65;
        vm.next();
        assert.strictEqual(vm.IO.screen, "A", 'OUT have to print character \'A\'');
    });
    it("ION", function () {
        var vm = new PDP8();
        vm.compile("ION");
        assert.strictEqual(vm.getRam(), "1111000010000000", 'ION have to be equal to 1111000010000000');
        
        vm.ctrlUnit.INT = false;
        vm.start()
          .next();
        assert.strictEqual(vm.ctrlUnit.INT, true, 'ION have to set INT to true in CtrlUnit');
    });
    it("IOF", function () {
        var vm = new PDP8();
        vm.compile("IOF");
        assert.strictEqual(vm.getRam(), "1111000001000000", 'IOF have to be equal to 1111000001000000');
        
        vm.start()
          .next();
        assert.strictEqual(vm.ctrlUnit.INT, false, 'IOF have to set INT to false in CtrlUnit');
    });
  });
  describe('Memory Reference Istructions', function () {
    it("AND", function () {
        var vm = new PDP8();
        vm.compile("AND 0");
        assert.strictEqual(vm.getRam().slice(1, 4), "000", 'AND  opt have to be 000');
    });
    it("ADD", function () {
        var vm = new PDP8();
        vm.compile("ADD 0");
        assert.strictEqual(vm.getRam().slice(1, 4), "001", 'ADD  opt have to be 001');
    });
    it("LDA", function () {
        var vm = new PDP8();
        vm.compile("LDA 0");
        assert.strictEqual(vm.getRam().slice(1, 4), "010", 'LDA  opt have to be 010');
    });
    it("STA", function () {
        var vm = new PDP8();
        vm.compile("STA 0");
        assert.strictEqual(vm.getRam().slice(1, 4), "011", 'STA  opt have to be 011');
    });
    it("BUN", function () {
        var vm = new PDP8();
        vm.compile("BUN 0");
        assert.strictEqual(vm.getRam().slice(1, 4), "100", 'BUN  opt have to be 100');
    });
    it("BSA", function () {
        var vm = new PDP8();
        vm.compile("BSA 0");
        assert.strictEqual(vm.getRam().slice(1, 4), "101", 'BSA  opt have to be 101');
    });
    it("ISZ", function () {
        var vm = new PDP8();
        vm.compile("ISZ 0");
        assert.strictEqual(vm.getRam().slice(1, 4), "110", 'ISZ  opt have to be 110');
    });
  });
  describe('Test compiler', function () {
    for (var cur_file of fs.readdirSync(path.join(__dirname, 'sources'))) {
        if (cur_file.slice(0, 4) !== 'res_') {
            it('Compile ' + cur_file, function () {
                var vm = new PDP8();
                vm.compile(fs.readFileSync(path.join(__dirname, 'sources', cur_file), { encoding: "utf-8" }));
                assert.strictEqual(vm.getRam(), 
                    fs.readFileSync(path.join(__dirname, 'sources', 'res_'+cur_file.replace(".asm", ".dump")), { encoding: "utf-8" }).replace(/(\r\n|\r)/g, '\n'), 
                    'Compile '+ cur_file + ' have to be correct');
            });
        }
    }
  });
  describe('Test execution', function () {
    it('Overflow check', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'overflow.asm'), { encoding: "utf-8" }));
        
        vm.start()
           .next()
           .next()
           .next()
           .next();
        
        var registers = vm.getRegisters();
        assert.strictEqual(registers.E, "1", "Overflow 32767 + 1: register E must be 1");
        assert.strictEqual(registers.AC, "1000000000000000", "Overflow 32767 + 1: register AC must be 1000000000000000");
        
        vm.next()
            .next();
        
        registers = vm.getRegisters();
        
        assert.strictEqual(registers.E, "0", "Register E have to be clean before next test");
        assert.strictEqual(registers.AC, "0000000000000000", "Register AC have to be clean before next test");
        
        vm.next()
            .next()
            .next()
            .next();
        
        registers = vm.getRegisters();
        
        assert.strictEqual(registers.E, "1", "Overflow -32768 - 1: register E must be 1");
        assert.strictEqual(registers.AC, "0111111111111111", "Overflow -32768 - 1: register AC must be 0111111111111111");
        
        assert.strictEqual(vm.ctrlUnit.S, false, "VM have to stop at the end of overflow test");
    });
    it('Print Hello World!', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'in_out.asm'), { encoding: "utf-8" }));
        
        vm.start()
          .next();
        vm.IO.inp_buff = 49;  // 1 in ASCII
        vm.next();

        while(vm.ctrlUnit.S) {
            vm.next();
        }
        
        assert.strictEqual(vm.IO.screen, "Hello World!", "'Hello World!' have to be prompet 1 time on screen");
    });
    it('Code Reference', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'jump.asm'), { encoding: "utf-8" }));
        
        vm.start();

        while(vm.ctrlUnit.S) {
            vm.next();
        }

        expect(vm.getCodeRef()).to.deep.equal({ PC: { source: 7, ram: 5 }, MAR: { source: 6, ram: 4 }, CUR_CMD: { ram: 4, source: 6}});
    });
    it('Stop', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'jump.asm'), { encoding: "utf-8" }));
        
        vm.start();
        
        assert.strictEqual(vm.ctrlUnit.S, true, 'VM have to start');
        
        vm.stop();
        
        assert.strictEqual(vm.ctrlUnit.S, false, 'VM have to stop');
    });
    it('Source Line ', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'jump.asm'), { encoding: "utf-8" }));

        assert.strictEqual(vm.getSourceLine(0), 3, 'First entry in ram is on line 3');
        assert.strictEqual(vm.getSourceLine(11), 14, 'Last entry in ram is on line 14');
    });
    it('Explain ', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'jump.asm'), { encoding: "utf-8" }));

        expect(vm.explain(vm.getRam().slice(0, 16)))
            .to.deep.equal({ 
                title: '0 | 010 | 000100000100', 
                content: 'Opcode: LDA\nAddr(Hex): 0x104\nDec Val(compl 2): 8452\nHex Val: 2104\n'
            });
        expect(vm.explain(vm.getRam().slice(187)))
            .to.deep.equal({ 
                title: '1 | 100 | 000100000110', 
                content: 'Opcode: BUN\nAddr(Hex): 0x106\nDec Val(compl 2): -16122\nHex Val: c106\n'
            });
    });
    it('Mul example', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'mul.asm'), { encoding: "utf-8" }));
        
        vm.start();

        while(vm.ctrlUnit.S) {
            vm.next();
        }
        
        assert.strictEqual(vm.getRam().slice(vm.getRam().length - 16), "0000101111011010", "74*41 = 3034 => 0000101111011010");
    });
    it('Last action', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'count_1.asm'), { encoding: "utf-8" }));
        
        vm.start();
        
        // test all fetch last actions
        vm.step();
        assert.strictEqual(vm.status.last_instr_exec, "MAR <- PC", "fetch at clock 0 have to be 'MAR <- PC'");
        vm.step();
        assert.strictEqual(vm.status.last_instr_exec, "MBR <- M , PC <- PC+1", "fetch at clock 1 have to be 'MBR <- M , PC <- PC+1'");
        vm.step();
        assert.strictEqual(vm.status.last_instr_exec, "OPR <- MBR(OP) , I <- MBR(I)", "fetch at clock 2 have to be 'OPR <- MBR(OP) , I <- MBR(I)'");
        vm.step();
        assert.strictEqual(vm.status.last_instr_exec, "if I == 1 && OPR != 111 => R <- 1 else F <- 1", "fetch at clock 3 have to be 'if I == 1 && OPR != 111 => R <- 1 else F <- 1'");
    });
    it('Count 1 example', function () {
        var vm = new PDP8();
        vm.compile(fs.readFileSync(path.join(__dirname, 'sources', 'count_1.asm'), { encoding: "utf-8" }));
        
        assert.strictEqual(vm.getRam(), 
                    fs.readFileSync(path.join(__dirname, 'sources', 'res_count_1.dump'), { encoding: "utf-8" }).replace(/(\r\n|\r)/g, '\n'), 
                    'Compile count_1.asm have to be correct');
        
        vm.start();

        while(vm.ctrlUnit.S) {
            vm.next();
        }
        
        assert.strictEqual(vm.registers.AC, 9, "AC have to be equal to 9");
    });
  });
});