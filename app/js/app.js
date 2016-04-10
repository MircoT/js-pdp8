(function() {
    const line_formatter = (lineNum) => {
        return "0x" + lineNum.toString(16);
    }
  
    const pdp8 = new PDP8();
    let running = false;
    let func_ref = null;

    const CMEditor = CodeMirror(document.getElementById('codeMirrorEditor'), {
        value: `ORG 100
LDA X
ADD Y
STA OUT
BUN T
X, DEC 32767
Y, DEC 1
OUT, DEC 0
T, CLA
CLE
LDA X2
ADD Y2
STA OUT2
HLT
X2, DEC -32768
Y2, DEC -1
OUT2, DEC 0
END`,/*`ORG 400
LDA 409
CMA
STA 409
LDA 40A
STA 40C
LDA 40B
STA 40A
LDA 40C
STA 40B
AND FFE I
9FC6
00AB
FFFF
END`,*/ //"/* test comment\nmultiline*/\n//comment on line\nORG 100\nLDA X\nBSA CHK\nINC\nHLT\nX, AND Y\nY, HEX 200\nCHK, DEC 0\nCIR\nSNA\nBUN CHK I\nADD X\nBUN CHK I\n\nEND",
//    value: `ORG 100 //PROGRAMMA SCRITTO IN ESADECIMALE
//7800
//7020
//7200
//1106
//7200
//7001
//0000
//END`,
        mode:  "pdp8",
        theme: "mdn-like",
        lineNumbers: true,
    });
  
    const CMViewer =  CodeMirror(document.getElementById('codeMirrorViewer'), {    
        mode:  "pdp8",
        theme: "mdn-like",
        lineNumbers: true,
        readOnly: true,
        lineNumberFormatter: line_formatter
    });
  
    const printErrors = (errors) => {
        try {
            $('#source_errors').empty();
            for (let key in errors) {
                if (key.indexOf("Error") !== -1) {
                    $('#source_errors').append( `<li class="list-group-item list-group-item-danger">[ ${key} ] => ${errors[key]}</p>` )    
                }
                else {
                    $('#source_errors').append( `<li class="list-group-item list-group-item-warning">[ ${key} ] => ${errors[key]}</p>` )
                }
                
            }
        }
        catch (err) {
            if (err instanceof TypeError) {
                console.log(err);
                console.error(`Error: printErrors requires jQuery (https://jquery.com/)!`);
            }
        }
    }
  
    CMEditor.on('change', function(cm) {
        let errors = pdp8.compile(cm.getDoc().getValue());
        CMViewer.setOption('firstLineNumber', pdp8.start_add);
        printErrors(errors);
        cleanLineStyles();
        pdp8.reset();
        updateStatus();
    })
  
    /*CMEditor.on('focus', function(cm) {
        let errors = pdp8.compile(cm.getDoc().getValue());
        CMViewer.setOption('firstLineNumber', pdp8.start_add);
        CMViewer.getDoc().setValue(pdp8.getRam());
        printErrors(errors);
    })*/
    
    const cleanLineStyles = () => {
        CMEditor.doc.eachLine((lineHdlr) => {
            CMEditor.removeLineClass(lineHdlr, 'text', 'pc-style');
            CMEditor.removeLineClass(lineHdlr, 'text', 'mar-style');
        });
        
        CMViewer.doc.eachLine((lineHdlr) => {
            CMViewer.removeLineClass(lineHdlr, 'text', 'pc-style');
            CMViewer.removeLineClass(lineHdlr, 'text', 'mar-style');
        });
    }
  
    let updateStatus = () => {
        let registers = pdp8.getRegisters();
        let ctrlUnit = pdp8.getCtrlUnit();
        let codeRef = pdp8.getCodeRef();
        CMViewer.getDoc().setValue(pdp8.getRam());
        
        // ----- SCREEN -----
        $("#terminal").text(pdp8.IO.screen);
        
        // ----- CLOCK -----
        $("#clock").text(pdp8.clock);

        // ----- REGISTERS -----
        $("#PC").text(registers.PC);
        $("#MBR").text(registers.MBR);
        $("#AC").text(registers.AC);
        $("#AC_INT").text(registers.AC_INT);
        $("#AC_HEX").text(registers.AC_HEX);
        $("#MAR").text(registers.MAR);
        $("#OPR").text(registers.OPR);
        $("#I").text(registers.I);
        $("#E").text(registers.E);
        
        // ----- CONTROL UNIT -----
        if (ctrlUnit.S === true) {
            $("#S").removeClass("label-danger")
                .addClass("label-success");
        }
        else {
            $("#S").removeClass("label-success")
                .addClass("label-danger");
            clearInterval(func_ref);
            CMEditor.setOption('readOnly', false);
            running = false;
            $("#btn_run").blur();
        }
        if (ctrlUnit.INT === true) {
            $("#INT").removeClass("label-danger")
                    .addClass("label-success");
        }
        else {
            $("#INT").removeClass("label-success")
                    .addClass("label-danger");
        }
        
        $("#F").text(ctrlUnit.F);
        $("#R").text(ctrlUnit.R);
        
        // ----- LINE HIGHLIGHT -----
        cleanLineStyles();
        
        let line_num = 1;

        CMEditor.doc.eachLine((lineHdlr) => {
            if (line_num === codeRef.PC.source) {
                CMEditor.addLineClass(lineHdlr, 'text', 'pc-style');
            }
            if (line_num === codeRef.MAR.source) {
                CMEditor.addLineClass(lineHdlr, 'text', 'mar-style');
            }
            line_num++;
        });
        
        line_num = 1;
        
        CMViewer.doc.eachLine((lineHdlr) => {
            if (line_num === codeRef.PC.ram) {
                CMViewer.addLineClass(lineHdlr, 'text', 'pc-style');
            }
            if (line_num === codeRef.MAR.ram) {
                CMViewer.addLineClass(lineHdlr, 'text', 'mar-style');
            }
            line_num++;
        });
        
        // ----- IPUNT -----
        if (pdp8.IO.wait) {
            let res = prompt("Insert 1 character");
            console.log(res, res.length)
            while (res.length > 1) {
                res = prompt("Insert 1 character");
            }
            pdp8.IO.inp_buff = (res !== '') ? res.charCodeAt(0) : 0;
        }
    }
    
    

    try {
        $("#btn_compile").mouseup(function(){
            $(this).blur();
        });
        $("#btn_reset").mouseup(function(){
            $(this).blur();
        });
        $("#btn_step").mouseup(function(){
            $(this).blur();
        });
        $("#btn_next").mouseup(function(){
            $(this).blur();
        });
        $("#btn_start").mouseup(function(){
            $(this).blur();
        });
        $("#btn_stop").mouseup(function(){
            $(this).blur();
        });
        
        // ----- COMPILE -----
        $("#btn_compile").click(function() {
            let errors = pdp8.compile(CMEditor.getDoc().getValue());
            CMViewer.setOption('firstLineNumber', pdp8.start_add);
            printErrors(errors);
            cleanLineStyles();
            pdp8.reset();
            updateStatus();
        })
        
        // ----- RESET -----
        $("#btn_reset").click(function() {
            clearInterval(func_ref);
            running = false;
            cleanLineStyles();
            pdp8.reset();
            updateStatus();
        });
        
        // ----- START -----
        $("#btn_start").click(function() {
            CMEditor.setOption('readOnly', true);
            pdp8.start();  
            updateStatus();        
        })
        
        // ----- STOP -----
        $("#btn_stop").click(function() {
            clearInterval(func_ref);
            running = false;
            CMEditor.setOption('readOnly', false);
            pdp8.stop();
            updateStatus();        
        })
        
        // ----- STEP -----
        $("#btn_step").click(function() {
            pdp8.step();  
            updateStatus();          
        })
        
        // ----- NEXT -----
        $("#btn_next").click(function() {
            pdp8.next();  
            updateStatus();        
        })
        
        // ----- RUN -----
        $("#btn_run").click(function() {
            if (pdp8.ctrlUnit.S) {
                if (!running) {
                    func_ref = setInterval(() => {
                        pdp8.step();  
                        updateStatus();
                    }, 55);
                    running = true;
                }
                else {
                    clearInterval(func_ref);
                    running = false;
                    $(this).blur();
                } 
            }
            else {
                $(this).blur();
            }
        })
    }
    catch (err) {
        if (err instanceof TypeError) {
            console.log(err);
            console.error(`Error: extended functions requires jQuery (https://jquery.com/)!`);
        }
    }
    
})();
