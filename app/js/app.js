(function() {
    'use strict';
    
    // Line formatter for VIEWER
    const line_formatter = (lineNum) => {
        return "0x" + lineNum.toString(16);
    }
  
    const pdp8 = new PDP8();  // pdp8 object
    let running = false;  // status running cycle
    let func_ref = null;  // reference of running cycle function
    
    // ----- EDITOR -----
    const CMEditor = CodeMirror(document.getElementById('codeMirrorEditor'), {
        value: `/* Code example */
LDA X // Load X in AC
STA Y // Store AC in Y
HLT   // STOP VM
X, DEC -1
Y, HEX 0`,
        mode:  "pdp8",
        theme: "mdn-like",
        lineNumbers: true,
    });
  
    // ----- VIEWER -----
    const CMViewer =  CodeMirror(document.getElementById('codeMirrorViewer'), {    
        mode:  "pdp8",
        theme: "mdn-like",
        lineNumbers: true,
        readOnly: true,
        lineNumberFormatter: line_formatter
    });
  
    // ----- Print EDITOR errors -----
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
    
    // ----- EDITOR event change -----
    CMEditor.on('change', (cm) => {
        let errors = pdp8.compile(cm.getDoc().getValue());
        CMViewer.setOption('firstLineNumber', pdp8.status.start_add);
        printErrors(errors);
        cleanPopover();
        cleanLineStyles();
        updateStatus();
    });
    
    // ----- Remove popover and styles for selected line -----
    const cleanPopover = () => {
        $(".selected").first().popover('hide');
        CMViewer.doc.eachLine((lineHdlr) => {
            CMViewer.removeLineClass(lineHdlr, 'text', 'selected');
        });
        CMEditor.doc.eachLine((lineHdlr) => {
            CMEditor.removeLineClass(lineHdlr, 'text', 'selected-source');
        });
    }
    
    // ----- Add popover and selected style -----
    const addPopover = () => {
        let obj = CMViewer.lineInfo(CMViewer.getCursor().line);
        $(".selected").first().popover('hide');
        CMViewer.doc.eachLine((lineHdlr) => {
            CMViewer.removeLineClass(lineHdlr, 'text', 'selected');
        });
        CMEditor.doc.eachLine((lineHdlr) => {
            CMEditor.removeLineClass(lineHdlr, 'text', 'selected-source');
        });
        CMViewer.addLineClass(obj.line, 'text', 'selected');
        CMEditor.addLineClass(pdp8.getSourceLine(+line_formatter(obj.line)) - 1, 'text', 'selected-source');
        let data = pdp8.explain(obj.text);
        $(".selected").first()
            .attr("data-toggle", "popover")
            .attr("data-trigger", "manual")
            .attr("data-html", "true")
            .attr("data-placement", "left")
            .attr("data-offset", "0 0")
            .attr("data-content", data.content.replace(/\n/g, "<br>"))
            .attr("title", data.title);
        $(function () {
            $('[data-toggle="popover"]').popover()
        })
        $(document).on("click", ".popover", cleanPopover);
        $(document).on("focusout", ".popover", cleanPopover);
        $(".selected").first().popover('show');
    }
    
    // ----- VIEWER touch event -----
    CMViewer.on('touchstart', (cm, evt) => {
        setTimeout(addPopover, 0);
    });
    
    // ----- VIEWER mouse click -----
    CMViewer.on('mousedown', (cm, evt) => {
        setTimeout(addPopover, 0);
    });
    
    // ----- Clean line css for execution -----
    const cleanLineStyles = () => {
        CMEditor.doc.eachLine((lineHdlr) => {
            CMEditor.removeLineClass(lineHdlr, 'text', 'pc-style');
            CMEditor.removeLineClass(lineHdlr, 'text', 'mar-style');
            CMEditor.removeLineClass(lineHdlr, 'wrap', 'cur-cmd');
        });
        
        CMViewer.doc.eachLine((lineHdlr) => {
            CMViewer.removeLineClass(lineHdlr, 'text', 'pc-style');
            CMViewer.removeLineClass(lineHdlr, 'text', 'mar-style');
            CMViewer.removeLineClass(lineHdlr, 'wrap', 'cur-cmd');
        });
    }
  
    // ----- Update pdp8 VM status -----
    let updateStatus = () => {
        let registers = pdp8.getRegisters();
        let codeRef = pdp8.getCodeRef();
        CMViewer.getDoc().setValue(pdp8.getRam());
        
        // ----- SCREEN -----
        $("#terminal").text(pdp8.IO.screen);
        
        // ----- STATUS -----
        $("#clock").text(pdp8.status.clock);
        $("#cycle").text(pdp8.status.cycle);
        $("#last_istr").text(pdp8.status.last_instr_exec);

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
        if (pdp8.ctrlUnit.S === true) {
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
            $("#btn_fast_run").blur();
        }
        if (pdp8.ctrlUnit.INT === true) {
            $("#INT").removeClass("label-danger")
                    .addClass("label-success");
        }
        else {
            $("#INT").removeClass("label-success")
                    .addClass("label-danger");
        }
        
        $("#F").text(pdp8.ctrlUnit.F);
        $("#R").text(pdp8.ctrlUnit.R);
        
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
            if (line_num === codeRef.CUR_CMD.source) {
                CMEditor.addLineClass(lineHdlr, 'wrap', 'cur-cmd');
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
            if (line_num === codeRef.CUR_CMD.ram) {
                CMViewer.addLineClass(lineHdlr, 'wrap', 'cur-cmd');
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
    
    
    // ----- ACTIONS -----
    try {
        $("#btn_open").mouseup(function(){ $(this).blur(); });
        $("#btn_save").mouseup(function(){ $(this).blur(); });
        $("#btn_compile").mouseup(function(){ $(this).blur(); });
        $("#btn_reset").mouseup(function(){ $(this).blur();});
        $("#btn_step").mouseup(function(){ $(this).blur(); });
        $("#btn_next").mouseup(function(){ $(this).blur(); });
        $("#btn_start").mouseup(function(){ $(this).blur(); });
        $("#btn_stop").mouseup(function(){ $(this).blur(); });

        // ----- KEYBOARD -----
        
        $( "#pdp8" ).keydown(function(evt) {
            if (pdp8.ctrlUnit.S) {
                var cur_char = String.fromCharCode(evt.keyCode).toLowerCase();
                if (cur_char === "s") {
                    pdp8.step();
                    updateStatus();
                }
                else if (cur_char === "n") {
                    pdp8.next();
                    updateStatus();
                }
                else if (cur_char === " ") {  // Space bar
                    if (!running) {
                        $("#btn_fast_run").addClass('active')
                        func_ref = setInterval(() => {
                            pdp8.next();  
                            updateStatus();
                        }, 55);
                        running = true;
                    }
                    else {
                        clearInterval(func_ref);
                        running = false;
                        $("#btn_fast_run").blur();
                        $("#btn_fast_run").removeClass('active');
                    }
                }
                return false;
            }
        });
        
        // ----- COMPILE -----
        $("#btn_compile").click(function() {
            let errors = pdp8.compile(CMEditor.getDoc().getValue());
            CMViewer.setOption('firstLineNumber', pdp8.status.start_add);
            printErrors(errors);
            cleanPopover();
            cleanLineStyles();
            updateStatus();
            $("#btn_fast_run").removeClass('active');
        })
        
        // ----- RESET -----
        $("#btn_reset").click(function() {
            clearInterval(func_ref);
            running = false;
            cleanPopover();
            cleanLineStyles();
            pdp8.reset();
            updateStatus();
            $("#btn_fast_run").removeClass('active');
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
            $("#btn_fast_run").removeClass('active');     
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

        // ----- FAST RUN -----
        $("#btn_fast_run").click(function() {
            if (pdp8.ctrlUnit.S) {
                if (!running) {
                    func_ref = setInterval(() => {
                        pdp8.next();  
                        updateStatus();
                    }, 55);
                    running = true;
                }
                else {
                    clearInterval(func_ref);
                    running = false;
                    $(this).blur();
                    $(this).removeClass('active');
                } 
            }
            else {
                $(this).blur();
            }
        })
        
        let openFileWith = (name) => {
            var chooser = document.querySelector(name);
            chooser.addEventListener("change", function(evt) {
                var fReader = new FileReader();
                fReader.readAsText(chooser.files[0]);
                fReader.onloadend = function(fs_evt){
                    CMEditor.doc.setValue(fs_evt.target.result);
                }
            }, false);
            chooser.click();  
        }
        
        openFileWith('#file_open');
        
        let saveFile = () => {
            var textFileAsBlob = new Blob([CMEditor.doc.getValue()], {type:'text/plain'});

            var downloadLink = document.createElement("a");
            downloadLink.download = "new_file.asm";
            downloadLink.innerHTML = "Download File";
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            // isFF from http://browserhacks.com/
            if (!!window.sidebar) { 
                // Firefox requires the link to be added to the DOM before it can be clicked.
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
        
        $("#btn_save").click(function () { saveFile(); });
    }
    catch (err) {
        if (err instanceof TypeError) {
            console.log(err);
            console.error(`Error: extended functions requires jQuery (https://jquery.com/)!`);
        }
    }
    
})();
