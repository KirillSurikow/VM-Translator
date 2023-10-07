class ASMCode {
    file;
    asmCode;
    calleeCounter = 0;
    allExecutions = [];
    fnName;
    label;
    returnAddress;
    callees = [];
    caller;
    isPushed = false;
    currentFunction = {};
    lvCounter = 0;
    arrOfSequences;
    command = '';



    constructor(obj) {
        this.arrOfSequences = obj
        this.createFunctionTree(obj)
        // this.wtf(obj)
        this.translateToASM(obj);

    }

    // wtf(arr){
    // let element = arr[1]['code'][1][1]
    // console.log(element)
    // }

    createFunctionTree(arr) {
        arr.forEach(element => {
            this.file = element['name'];
            element['code'].forEach(expr => {
                if (this.isFunction(expr)) {
                    this.calleeCounter = 0;
                    this.fnName = this.generateName(expr[1]);
                    this.label = expr[1];
                    this.lvCounter = parseInt(expr[2]);
                }
                if (this.isCall(expr)) {
                    let callee = {
                        'caller': this.fnName,
                        'label': expr[1],
                        'returnTo': `${this.file}.${this.fnName}$ret.${this.calleeCounter}`,
                        'assigned': false,
                        'argCount': parseInt(expr[2]),
                    }
                    this.callees.push(callee);
                    this.calleeCounter++;
                    this.allExecutions.push(callee)
                }
            })
        });
    }



    // CALL///////////////////////////////////

    // if (this.isCall(expr)) {
    //     console.log(expr)
    //     let callee = {
    //         'name': `${this.file}.${expr[1]}`,
    //         'label': `${this.file}.${this.fnName}$${expr[1]}`,
    //         'returnTo': `${this.file}.${this.fnName}$ret.${this.calleeCounter}`,
    //         'assigned': false,
    //         'argCount': parseInt(expr[2])
    //     }
    //     this.callees.push(callee);
    //     this.calleeCounter++;
    // }

    // FUNCTION////////////////////////////////7

    // if (this.isFunction(expr)) {
    //     if (expr[1] == `${this.file}.init`) {
    //         this.fnName = this.generateName(expr[1]);
    //         this.label = `${this.file}.${this.fnName}`;
    //         this.lvCounter = parseInt(expr[2]);
    //     } else {
    //         if (!this.isPushed) {
    //             let fn = {
    //                 'functionName': this.fnName,
    //                 'functionLabel': this.label,
    //                 'lvCount': this.lvCounter,
    //                 'callees': this.callees,
    //                 'returnAddress': this.returnAddress
    //             };
    //             this.functionTree.push(fn);
    //             this.fnName = '';
    //             this.lvCounter = 0;
    //             this.label = '';
    //             this.calleeCounter = 0;
    //             this.callees = [];
    //             this.caller = undefined;
    //             this.returnAddress = undefined;
    //         }
    //         this.isPushed = false;
    //         this.fnName = this.generateName(expr[1]);
    //         this.lvCounter = parseInt(expr[2]);
    //         this.findCallerAndReturnTo(this.fnName);
    //         this.label = `${this.file}.${this.caller}$${this.fnName}`;
    //     }
    // }

    //////////////////////


    //RETURN////////////////////////////////////////

    // if (this.isReturn(expr)) {
    //     let fn = {
    //         'functionName': this.fnName,
    //         'functionLabel': this.label,
    //         'lvCount': this.lvCounter,
    //         'callees': this.callees,
    //         'returnAddress': this.returnAddress
    //     };
    //     this.functionTree.push(fn);
    //     this.fnName = '';
    //     this.lvCounter = 0;
    //     this.label = '';
    //     this.calleeCounter = 0;
    //     this.callees = [];
    //     this.caller = {};
    //     this.isPushed = true;
    // }

    /////////////////////////////////////////////

    translateToASM(arr) {
        this.command += this.returnInitializeMemSeg();
        arr.forEach(element => {
            this.file = element['name'];
            element['code'].forEach(expr => {
                if (this.isFunction(expr) && expr[1] == 'Sys.init') {
                    let label = 'Sys.init';
                    let lvCount = parseInt(expr[2])
                    this.command += this.returnFunctionLabel(label);
                    for (let i = 0; i < lvCount; i++) {
                        this.command += this.returninitiateLocals(i);
                    }
                }
                if (this.isFunction(expr)) {
                    let reference = expr[1]
                    let referingFunction = this.allExecutions.find((fn) => fn['label'] == reference);
                    if (referingFunction) {
                        this.currentFunction = referingFunction;
                        let label = this.currentFunction['label'];
                        let lvCount = parseInt(expr[2])
                        this.command += this.returnFunctionLabel(label);
                        for (let i = 0; i < lvCount; i++) {
                            this.command += this.returninitiateLocals(i);
                        }
                    }
                }
                if (this.isCall(expr)) {
                    let callee = this.allExecutions.find((callee) => callee['label'] == expr[1] && !callee['assigned']);
                    let argRepos = 5 + callee['argCount'];
                    this.command += this.returnCallAsm(expr, callee, argRepos);
                    callee['assigned'] = true;
                }
                if (this.isReturn(expr)) {
                    this.command += this.returnReturn();
                }
                if (this.isPushConstant(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPushConstant(address, expr);
                }
                if (this.isPushLocal(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPushLocal(address, expr);
                }
                if (this.isPushArgument(expr)) { 
                    let address = expr[2];
                    this.command += this.returnASMPushArgument(address, expr);
                }
                if (this.isPushThis(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPushThis(address, expr);
                }
                if (this.isPushThat(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPushThat(address, expr);
                }
                if (this.isPushTemp(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPushTemp(address, expr);
                }
                if (this.isPushStatic(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPushStatic(address, expr);
                }
                if (this.isPushPointer(expr)) {
                    if (expr[2] === 0) {
                        let address = 'THIS';
                        this.command += this.returnASMPushPointer(address, expr);
                    } else {
                        let address = 'THAT';
                        this.command += this.returnASMPushPointer(address, expr);
                    }
                }
                if (this.isPopLocal(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPopLocal(address, expr);
                }
                if (this.isPopArgument(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPopArgument(address, expr);
                }
                if (this.isPopThis(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPopThis(address, expr);
                }
                if (this.isPopThat(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPopThat(address, expr);
                }
                if (this.isPopTemp(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPopTemp(address, expr);
                }
                if (this.isPopStatic(expr)) {
                    let address = expr[2];
                    this.command += this.returnASMPopStatic(address, expr);
                }
                if (this.isPopPointer(expr)) {
                    if (expr[2] === 0) {
                        let address = 'THIS';
                        this.command += this.returnASMPopPointer(address, expr);
                    } else {
                        let address = 'THAT';
                        this.command += this.returnASMPopPointer(address, expr);
                    }
                }
                if (this.isLabel(expr)) {
                    this.command += this.returnLabel(expr);
                }
                if (this.isIfGoTo(expr)) {
                    this.command += this.returnIfGoTo(expr);
                }
                if (this.isGoTo(expr)) {
                    this.command += this.returnGoTo(expr);
                }

                if (this.isAddidtion(expr)) {
                    this.command += this.returnAddition();
                }
                if (this.isSubstraction(expr)) {
                    this.command += this.returnSubstraction();
                }
                if (this.isEqual(expr)) {
                    this.command += this.returnEqual();
                }
                if (this.isLowerThan(expr)) {
                    this.command += this.returnLowerThan();
                }
                if (this.isGreaterThan(expr)) {
                    this.command += this.returnGreaterThan();
                }
                if (this.isNeg(expr)) {
                    this.command += this.returnNeg();
                }
                if (this.isAnd(expr)) {
                    this.command += this.returnAnd();
                }
                if (this.isOr(expr)) {
                    this.command += this.returnOr();
                }
                if (this.isNot(expr)) {
                    this.command += this.returnNot();
                }
            });
        })

        this.command += this.returnEndAsm();
    }

    isPushConstant(expr) {
        return expr[0] === "push" && expr[1] === "constant";
    }

    isPushArgument(expr) {
        return expr[0] === "push" && expr[1] === "argument";
    }

    isPushThis(expr) {
        return expr[0] === "push" && expr[1] === "this";
    }

    isPushThat(expr) {
        return expr[0] === "push" && expr[1] === "that";
    }

    isPopLocal(expr) {
        return expr[0] === "pop" && expr[1] === "local";
    }

    isPopArgument(expr) {
        return expr[0] === "pop" && expr[1] === "argument";
    }

    isPopThis(expr) {
        return expr[0] === "pop" && expr[1] === "this";
    }

    isPopThat(expr) {
        return expr[0] === "pop" && expr[1] === "that";
    }

    isPopTemp(expr) {
        return expr[0] === "pop" && expr[1] === "temp";
    }

    isPopStatic(expr) {
        return expr[0] === "pop" && expr[1] === "static";
    }

    isPopPointer(expr) {
        return expr[0] === "pop" && expr[1] === "pointer";
    }

    isPushLocal(expr) {
        return expr[0] === "push" && expr[1] === "local";
    }

    isPopArgument(expr) {
        return expr[0] === "pop" && expr[1] === "argument";
    }

    isPushThis(expr) {
        return expr[0] === "push" && expr[1] === "this";
    }

    isPushThat(expr) {
        return expr[0] === "push" && expr[1] === "that";
    }

    isPushTemp(expr) {
        return expr[0] === "push" && expr[1] === "temp";
    }

    isPushStatic(expr) {
        return expr[0] === "push" && expr[1] === "static";
    }

    isPushPointer(expr) {
        return expr[0] === "push" && expr[1] === "pointer";
    }

    isAddidtion(expr) {
        return expr[0] == 'add';
    }

    isSubstraction(expr) {
        return expr[0] == 'sub';
    }

    isEqual(expr) {
        return expr[0] == 'eq';
    }

    isLowerThan(expr) {
        return expr[0] === 'lt';
    }

    isGreaterThan(expr) {
        return expr[0] == 'gt';
    }

    isAnd(expr) {
        return expr[0] == 'and';
    }

    isNeg(expr) {
        return expr[0] == 'neg';
    }

    isNeg(expr) {
        return expr[0] == 'and';
    }

    isOr(expr) {
        return expr[0] == 'or';
    }

    isNot(expr) {
        return expr[0] == 'not';
    }

    isLabel(expr) {
        return expr[0] == 'label';
    }

    isIfGoTo(expr) {
        return expr[0] == 'if-goto';
    }

    isGoTo(expr) {
        return expr[0] == 'goto';
    }

    isReturn(expr) {
        return expr[0] == 'return';
    }

    isFunction(expr) {
        return expr[0] == 'function';
    }

    isCall(expr) {
        return expr[0] == 'call';
    }

    returnInitializeMemSeg(){
        return `
            @256              // Lade den gewünschten Startwert in das A-Register
            D=A               // Speichere den Wert im D-Register
            @SP              // Lade die Basisadresse des SP-Segments in das A-Register
            M=D               // Setze die Basisadresse auf den gewünschten Startwert
            @500              // Lade den gewünschten Startwert in das A-Register
            D=A               // Speichere den Wert im D-Register
            @LCL              // Lade die Basisadresse des LCL-Segments in das A-Register
            M=D               // Setze die Basisadresse auf den gewünschten Startwert
            @1000              // Lade den gewünschten Startwert in das A-Register
            D=A               // Speichere den Wert im D-Register
            @ARG              // Lade die Basisadresse des ARG-Segments in das A-Register
            M=D               // Setze die Basisadresse auf den gewünschten Startwert
            @1500              // Lade den gewünschten Startwert in das A-Register
            D=A               // Speichere den Wert im D-Register
            @THIS              // Lade die Basisadresse des THIS-Segments in das A-Register
            M=D               // Setze die Basisadresse auf den gewünschten Startwert
            @2000              // Lade den gewünschten Startwert in das A-Register
            D=A               // Speichere den Wert im D-Register
            @THAT              // Lade die Basisadresse des THAT-Segments in das A-Register
            M=D               // Setze die Basisadresse auf den gewünschten Startwert`
    }

    returnASMPushConstant(address, expr) {
        return `
        @${address}  // ${expr[0]} ${expr[1]} ${expr[2]} start 
        D = A
        @SP
        A = M
        M = D
        @SP
        M = M + 1 // ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushLocal(address, expr) {
        return `
        @${address}      // Lade den Wert ${address} in den A-Register  // ${expr[0]} ${expr[1]} ${expr[2]} start
        D=A       // Speichere den Wert in das D-Register
        @LCL      // Lade die Basisadresse des Localsegments (LCL) in den A-Register
        A=M+D     // Berechne die Adresse des zu lesenden Elements 
        D=M       // Lade den Wert des Elements in das D-Register
        @SP       // Lade den Stack-Pointer in den A-Register
        A=M       // Lade die Adresse, auf die der Stack-Pointer zeigt
        M=D       // Speichere den Wert von D an dieser Adresse (Wert auf den Stapel legen)
        @SP       // Lade den Stack-Pointer in den A-Register
        M=M+1     // Erhöhe den Stack-Pointer (SP = SP + 1)// ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushArgument(address, expr) {
        return `
        @${address}      // Lade den Wert ${address} in den A-Register   // ${expr[0]} ${expr[1]} ${expr[2]} start
        D=A       // Speichere den Wert in das D-Register
        @ARG      // Lade die Basisadresse des Argumentsegments (ARG) in den A-Register
        A=M+D     // Berechne die Adresse des zu lesenden Elements 
        D=M       // Lade den Wert des Elements in das D-Register
        @SP       // Lade den Stack-Pointer in den A-Register
        A=M       // Lade die Adresse, auf die der Stack-Pointer zeigt
        M=D       // Speichere den Wert von D an dieser Adresse (Wert auf den Stapel legen)
        @SP       // Lade den Stack-Pointer in den A-Register
        M=M+1     // Erhöhe den Stack-Pointer (SP = SP + 1)// ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushThis(address, expr) {
        return `
        @${address}      // Lade den Wert ${address} in den A-Register  // ${expr[0]} ${expr[1]} ${expr[2]} start
        D=A       // Speichere den Wert in das D-Register
        @THIS      // Lade die Basisadresse des This-segments (This) in den A-Register
        A=M+D     // Berechne die Adresse des zu lesenden Elements 
        D=M       // Lade den Wert des Elements in das D-Register
        @SP       // Lade den Stack-Pointer in den A-Register
        A=M       // Lade die Adresse, auf die der Stack-Pointer zeigt
        M=D       // Speichere den Wert von D an dieser Adresse (Wert auf den Stapel legen)
        @SP       // Lade den Stack-Pointer in den A-Register
        M=M+1     // Erhöhe den Stack-Pointer (SP = SP + 1) // ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushThat(address, expr) {
        return `
        @${address}      // Lade den Wert ${address} in den A-Register   // ${expr[0]} ${expr[1]} ${expr[2]} start
        D=A       // Speichere den Wert in das D-Register
        @THAT      // Lade die Basisadresse des That-segments (That) in den A-Register
        A=M+D     // Berechne die Adresse des zu lesenden Elements 
        D=M       // Lade den Wert des Elements in das D-Register
        @SP       // Lade den Stack-Pointer in den A-Register
        A=M       // Lade die Adresse, auf die der Stack-Pointer zeigt
        M=D       // Speichere den Wert von D an dieser Adresse (Wert auf den Stapel legen)
        @SP       // Lade den Stack-Pointer in den A-Register
        M=M+1     // Erhöhe den Stack-Pointer (SP = SP + 1)   // ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushTemp(address, expr) {
        return `
        @${address}      // Lade den Wert ${address} in den A-Register   // ${expr[0]} ${expr[1]} ${expr[2]} start
        D=A       // Speichere den Wert in das D-Register
        @5    // Lade die Basisadresse des Temp-segments (This) in den A-Register
        A=A+D     // Berechne die Adresse des zu lesenden Elements 
        D=M       // Lade den Wert des Elements in das D-Register
        @SP       // Lade den Stack-Pointer in den A-Register
        A=M       // Lade die Adresse, auf die der Stack-Pointer zeigt
        M=D       // Speichere den Wert von D an dieser Adresse (Wert auf den Stapel legen)
        @SP       // Lade den Stack-Pointer in den A-Register
        M=M+1     // Erhöhe den Stack-Pointer (SP = SP + 1)  // ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushStatic(address, expr) {
        return `
           @${this.file}.${address} // Lade den Wert der statischen Variable mit Index ${address} in das D-Register  // ${expr[0]} ${expr[1]} ${expr[2]} start
            D=M
            @SP  // Speichere den Wert des D-Registers auf dem Stack
            A=M
            M=D
            @SP// Erhöhe den Stack-Pointer (SP = SP + 1)
            M=M+1// ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushPointer(address, expr) {
        return `
         @${address} // Lade die Adresse des Speicherbereichs "this" in den A-Register   // ${expr[0]} ${expr[1]} ${expr[2]} start
        D=M   // Lade den Wert aus dem Speicherbereich "this" in das D-Register
        @SP   // Lade den Wert des Stack Pointers in den A-Register
        A=M   // Setze A auf die Speicheradresse, die der Wert des Stack Pointers angibt
        M=D   // Speichere den Wert aus dem D-Register an der aktuellen Stelle auf dem Stack
        @SP   // Lade den Wert des Stack Pointers in den A-Register
        M=M+1 // Erhöhe den Stack Pointer, um Platz für das neu gepushte Element zu schaffen  // ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPushArgument(address, expr) {
        return `
         @${address}      // Lade den Wert ${address} in den A-Register  // ${expr[0]} ${expr[1]} ${expr[2]} start
        D=A       // Speichere den Wert in das D-Register
        @ARG      // Lade die Basisadresse des Argumentsegments (ARG) in den A-Register
        A=M+D     // Berechne die Adresse des zu lesenden Elements 
        D=M       // Lade den Wert des Elements in das D-Register
        @SP       // Lade den Stack-Pointer in den A-Register
        A=M       // Lade die Adresse, auf die der Stack-Pointer zeigt
        M=D       // Speichere den Wert von D an dieser Adresse (Wert auf den Stapel legen)
        @SP       // Lade den Stack-Pointer in den A-Register
        M=M+1     // Erhöhe den Stack-Pointer (SP = SP + 1) // ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPopLocal(address, expr) {
        return `
            @LCL // Adresse des lokalen Segments laden  // ${expr[0]} ${expr[1]} ${expr[2]} start
            D = M
            @${address} // Offset für das lokale Segment 
            D = D + A // Die Adresse des lokalen Elements berechnen
            @R13 // Speicherort für den Speicherbereich R13 wählen
            M = D // Die berechnete Adresse in R13 speichern
            @SP
            AM = M - 1 // Stack-Pointer um eins reduzieren, A auf das oberste Element setzen
            D = M // Wert des obersten Elements im D-Register speichern
            @R13
            A = M // Die zu beschreibende Adresse in A laden
            M = D // Wert vom Stack in das lokale Segment schreiben`
    }

    returnASMPopArgument(address, expr) {
        return `
           @ARG // Adresse des Argument Segments laden  // ${expr[0]} ${expr[1]} ${expr[2]} start
            D = M
            @${address} // Offset für das Argument Segment 
            D = D + A // Die Adresse des Argument Elements berechnen
            @R13 // Speicherort für den Speicherbereich R13 wählen
            M = D // Die berechnete Adresse in R13 speichern
            @SP
            AM = M - 1 // Stack-Pointer um eins reduzieren, A auf das oberste Element setzen
            D = M // Wert des obersten Elements im D-Register speichern
            @R13
            A = M // Die zu beschreibende Adresse in A laden
            M = D // Wert vom Stack in das Argument Segment schreiben`
    }

    returnASMPopThis(address, expr) {
        return `
           @THIS // Adresse des This Segments laden // ${expr[0]} ${expr[1]} ${expr[2]} start
            D = M
            @${address} // Offset für das This Segment 
            D = D + A // Die Adresse des This Elements berechnen
            @R13 // Speicherort für den Speicherbereich R13 wählen
            M = D // Die berechnete Adresse in R13 speichern
            @SP
            AM = M - 1 // Stack-Pointer um eins reduzieren, A auf das oberste Element setzen
            D = M // Wert des obersten Elements im D-Register speichern
            @R13
            A = M // Die zu beschreibende Adresse in A laden
            M = D // Wert vom Stack in das This Segment schreiben`
    }

    returnASMPopThat(address, expr) {
        return `
           @THAT // Adresse des That Segments laden // ${expr[0]} ${expr[1]} ${expr[2]} start
            D = M
            @${address} // Offset für das That Segment 
            D = D + A // Die Adresse des That Elements berechnen
            @R13 // Speicherort für den Speicherbereich R13 wählen
            M = D // Die berechnete Adresse in R13 speichern
            @SP
            AM = M - 1 // Stack-Pointer um eins reduzieren, A auf das oberste Element setzen
            D = M // Wert des obersten Elements im D-Register speichern
            @R13
            A = M // Die zu beschreibende Adresse in A laden
            M = D // Wert vom Stack in das That Segment schreiben`
    }

    returnASMPopTemp(address, expr) {
        return `
            @5 // Adresse des Temp Segments laden  // ${expr[0]} ${expr[1]} ${expr[2]} start
            D = A
            @${address} // Offset für das Temp Segment 
            D = D + A // Die Adresse des Temp Elements berechnen
            @R13 // Speicherort für den Speicherbereich R13 wählen
            M = D // Die berechnete Adresse in R13 speichern
            @SP
            AM = M - 1 // Stack-Pointer um eins reduzieren, A auf das oberste Element setzen
            D = M // Wert des obersten Elements im D-Register speichern
            @R13
            A = M // Die zu beschreibende Adresse in A laden
            M = D // Wert vom Stack in das Temp Segment schreiben`
    }

    returnASMPopStatic(address, expr) {
        return `
            @SP  // ${expr[0]} ${expr[1]} ${expr[2]} start
            AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
            D=M // D = Wert des obersten Elements (zu speichernder Wert)
            @${this.file}.${address} // Lade das Label für die statische Variable mit Index ${address}
            M=D // Wert vom Stack in die statische Variable schreiben // // ${expr[0]} ${expr[1]} ${expr[2]} end`
    }

    returnASMPopPointer(address, expr) {
        return `
            @SP // Speichere den Wert des Stacks in ${address} (Adresse 4 des Speichersegments 'pointer')  // ${expr[0]} ${expr[1]} ${expr[2]} start
            AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
            D=M // D = Wert des obersten Elements (erstes Argument)
            @${address}
            M=D // 'THAT' auf den Wert des Stacks setzen   `
    }

    returnAddition() {
        return `
         @SP  // Addition start
        AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
        D=M // D = Wert des obersten Elements (erstes Argument)
        @SP
        AM=M-1 // A auf das zweitoberste Element des Stacks setzen, M auf den Wert des zweitobersten Elements setzen
        M=M+D // Wert des zweitobersten Elements = Wert des zweitobersten Elements + Wert des obersten Elements (Addition)
        @SP
        M=M+1 // Stack-Pointer wieder erhöhen // Addition end`
    }

    returnSubstraction() {
        return `
        @SP // Substraction start
        AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
        D=M // D = Wert des obersten Elements (erstes Argument)
        @SP
        AM=M-1 // A auf das zweitoberste Element des Stacks setzen, M auf den Wert des zweitobersten Elements setzen
        M=M-D // Wert des zweitobersten Elements = Wert des zweitobersten Elements - Wert des obersten Elements (Substraktion)
        @SP
        M=M+1 // Stack-Pointer wieder erhöhen// Substraction end`
    }

    returnEqual() {
        return `
        @SP // Comparison start
        AM=M-1 //  A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
        D=M // D = Wert des obersten Elements (erstes Argument)
        @SP
        AM = M - 1 // A auf das zweitoberste Element des Stacks setzen, M auf den Wert des zweitobersten Elements setzen
        D = M - D // D = Wert des zweitobersten Elements - Wert des obersten Elements
        @TRUE
        D ; JEQ
       @SP // Wenn D != 0 (nicht gleich), dann setze 0 (false) auf den Stack
        A=M
        M=0
        @SP
        M=M+1
        @END
        0;JMP
        (TRUE) // Wenn D = 0 (gleich), dann setze -1 (true) auf den Stack
        @SP
        A=M
        M=1
        @SP
        M=M+1
        @END
        0;JMP// Comparison end`
    }

    returnLowerThan() {
        return `
            @SP // lt (Less Than, Vergleich)
            AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
            D=M // D = Wert des obersten Elements (erstes Argument)
            @SP
            AM=M-1 // A auf das zweitoberste Element des Stacks setzen, M auf den Wert des zweitobersten Elements setzen
            D=M-D // D = Wert des zweitobersten Elements - Wert des obersten Elements
            @TRUE // Wenn D < 0 (kleiner als), dann springe zu TRUE
            D;JLT
            // Wenn D >= 0 (nicht kleiner als), dann setze 0 (false) auf den Stack
            @SP
            A=M
            M=0
            @SP
            M=M+1
            @END
            0;JMP
            (TRUE) // Wenn D < 0 (kleiner als), dann setze -1 (true) auf den Stack
            @SP
            A=M
            M=-1
            @SP
            M=M+1
            (END)`
    }

    returnGreaterThan() {
        return ` @SP // gt (Greater Than, Vergleich)
                   AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
                   D=M // D = Wert des obersten Elements (erstes Argument)
                   @SP
                   AM = M-1
                   D = D - M
                   @TRUE
                   D ; JGT
                   @SP
                   A = M
                   M = 0
                   @SP
                   A = M
                   M = M + 1
                   @END
                   0 ; JMP
                   (TRUE)
                   @SP
                   A = M
                   M = -1
                   @SP
                   A = M
                   M = M + 1
                   @END
                   0 ; JMP`
    }

    returnNeg() {
        return ` 
            @SP // neg (Negation)
            A=M-1 // A auf das oberste Element des Stacks setzen
            M=-M // Negiere den Wert des obersten Elements `
    }

    returnAnd() {
        return `
            @SP  // and (AND-Verknüpfung)
            AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
            D=M // D = Wert des obersten Elements (erstes Argument)
            @SP
            A=M-1 // A auf das zweitoberste Element des Stacks setzen
            M=M&D // Wert des zweitobersten Elements = Wert des zweitobersten Elements AND Wert des obersten Elements (AND-Verknüpfung) `
    }

    returnOr() {
        return ` 
            @SP  // or (OR-Verknüpfung)
            AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
            D=M // D = Wert des obersten Elements (erstes Argument)
            @SP
            A=M-1 // A auf das zweitoberste Element des Stacks setzen
            M=M|D // Wert des zweitobersten Elements = Wert des zweitobersten Elements OR Wert des obersten Elements (OR-Verknüpfung)`
    }

    returnNot() {
        return `
        @SP
        AM=M-1 // A auf das oberste Element des Stacks setzen, M auf den Wert des obersten Elements setzen
        M=!M // Wert des obersten Elements negieren`
    }

    returnLabel(expr) {
        return `
        (${this.file}$${expr[1]})`
    }

    returnIfGoTo(expr) {
        return `
            @SP
            AM=M-1
            D=M
            @${this.file}$${expr[1]}
            D;JNE`
    }

    returnFunctionLabel(expr) {
        return `
        (${expr})
        `
    }

    returninitiateLocals(i) {
        return `
           @0 //push local ${i}
           D=A
           @SP
           A=M
           M=D
           @SP
           M=M+1//`
    }

    returnReturn() {
        return `
            @LCL//saving the End of the frame
            D=M
            @R13
            M=D 

            @5 //getting the return address
            D=A
            @R13
            D=M-D
            A=D
            D=M
            @R15
            M=D

             @SP  //return value
             A=M-1
             D=M
             @ARG
             A=M
             M=D

     @ARG   //repositioning the Stackpointer after the called function
     D=M+1
     @SP
     M=D

            @R13 //Restoring That
            A=M-1
            D=M
            @THAT
            M=D
            @2 //Restoring This
            D=A
            @R13
            A=M-D
            D=M
            @THIS
            M=D
            @3 //Restoring ARG
            D=A
            @R13
            A=M-D
            D=M
            @ARG
            M=D
            @4 //Restoring LCL
            D=A
            @R13
            A=M-D
            D=M
            @LCL
            M=D  //

            @R15
            A=M
            0;JMP
            `
    }




    // @SP
    // A=M-1
    // D=M
    // A=D
    // 0;JMP

    
    // @5 // getting the return address
    // D=A
    // @R13
    // D=M-D
    // @SP
    // A=M
    // M=D
    // @SP
    // M=M+1


    returnCallAsm(expr, callee, argRepos) {
        return `
        @${callee['returnTo']} // start call push Return Address 3x ${expr[0]} ${expr[1]}
            D=A
            @SP
            A=M
            M=D
            @SP
            M=M+1
            @LCL //push LCL
            D=M
            @SP
            A=M
            M=D
            @SP
            M=M+1
            @ARG //push ARG
            D=M
            @SP
            A=M
            M=D
            @SP
            M=M+1
            @THIS  //push THIS
            D=M
            @SP
            A=M
            M=D
            @SP
            M=M+1
            @THAT //push THAT
            D=M
            @SP
            A=M
            M=D
            @SP
            M=M+1
            @${argRepos} //Reposition ARG 
            D=A
            @SP
            D=M-D // eventuell Fehler
            @ARG
            M=D
            @SP //Reposition LCL
            D=M
            @LCL
            M=D
            @${callee['label']} //Go to Targetfunction
            0;JMP
            (${callee['returnTo']}) // End Call Return label`
    }

    returnGoTo(expr) {
        return `
            @${this.file}$${expr[1]}
            0;JMP `
    }

    returnEndAsm() {
        return `
        (End)
        @End
        0 ; JMP`;
    }

    generateName(string) {
        let expr = string.replace(/.*\.(.*)\(\)/, "$1");
        return expr.split(".")[1];
    }

    splitCallee(string) {
        let expr = string.replace(/.*\.(.*)\(\)/, "$1");
        return expr.split(".")[1];
    }

    findCallerAndReturnTo(calledFn) {
        this.functionTree.forEach(fn => {
            fn['callees'].forEach(callee => {
                let reference = this.splitCallee(callee['name']);
                if (calledFn == reference && !callee['assigned']) {
                    this.caller = fn['functionName'];
                    this.returnAddress = callee['returnTo'];

                    callee['assigned'] = true;
                }
            });
        });
    }

}

module.exports = ASMCode; 