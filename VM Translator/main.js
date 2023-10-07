const fs = require('fs');
const VMCode = require('./parser');
const ASMCode = require('./codeWriter');
const { resolve } = require('path');
const { rejects } = require('assert');
const project = '08';
const category = 'FunctionCalls';
const folder = 'StaticsTest';
const directoryPath = `./${project}/${category}/${folder}`;


function processVMFiles(vmFiles) {
    let allPromises = vmFiles.map(file => readFileUsingPromise(file))
    Promise.all(allPromises)
        .then((vmSequences) => prepareVmSequences(vmSequences) )
}

function prepareVmSequences(vmSequences){
   let sysIndex = vmSequences.findIndex(vmSequence => vmSequence['name'] == 'Sys');
   let targetSequence = vmSequences[sysIndex];
   vmSequences.splice(sysIndex);
   vmSequences.unshift(targetSequence);
   createASM(vmSequences);
}

function readFileUsingPromise(file) {
  return new Promise((resolve, reject) => {
        try {
                fs.readFile(`./${project}/${category}/${folder}/${file}`, 'utf-8', (err, additionRaw) => {
                    if (err) {
                        console.error('Fehler beim Lesen der Datei:', err);
                        return
                    } else {
                        let vmObject = new VMCode(additionRaw);
                        let vmSequence = vmObject.additionMappedArray;
                        let fileName = file.replace('.vm','');
                        resolve( {
                            'name': fileName,
                            'code': vmSequence
                        })
                    }
                }); 
        } catch (error) {
            console.log(error)
        }
    })
}


// Promise.all(
//     vmFiles.forEach(file => {
//         new Promise((resolve, reject) =>{
//             try {
//                 fs.readFile(`./${project}/${category}/${folder}/${file}`, 'utf-8', (err, additionRaw) => {
//                     if (err) {
//                         console.error('Fehler beim Lesen der Datei:', err);
//                         return
//                     } else {
//                         let vmObject = new VMCode(additionRaw);
//                         let vmSequence = vmObject.additionMappedArray;
//                         resolve(file, vmSequence)
//                     }
//                 });

//             } catch (error) {
//                 console.log(error)
//             }
//         })
//     })
// ).then((values)=>{
//     console.log(values)
// })




function createASM(arr) {
    let asmObject = new ASMCode(arr);
    let asmString = asmObject.command;
    createOutputFile(asmString);
}

function createOutputFile(output) {
    fs.writeFile(`C:/Users/ksuri/OneDrive/Desktop/Build a Computer/nand2tetris/projects/08/FunctionCalls/StaticsTest/StaticsTest.asm`, output, (err) => {
        if (err) {
            console.error('Fehler beim Schreiben der Datei:', err);
        } else {
            console.log('Datei erfolgreich erstellt: ./output/SimpleAddOutput.asm');
        }
    });
}

new Promise((resolve, reject) => {
    try {
        let path = directoryPath;
        const files = fs.readdirSync(path, 'utf-8');
        const vmFiles = files.filter((file) => file.endsWith('vm'));
        resolve(vmFiles);
    } catch (error) {
        reject(`Fehler beim Lesen des Verzeichnisses ${directoryPath}: ${error}`);
    }
}).then(processVMFiles)
    .catch((error) => {
        console.error(error);
    })







// let allFiles = fs.readdirSync(`./${project}/${category}/${folder}`, 'utf-8');
// allFiles.forEach(element => {
//     if (element.slice(-2) == 'vm') {
//         vmFiles.push(element);
//     }
// });


// totalVMSequence = createSequence();

// async function createSequence() {
//     let arr = [];
//     vmFiles.forEach(async file => {
//         await fs.readFile(`./${project}/${category}/${folder}/${file}`, 'utf-8', (err, additionRaw) => {
//             if (err) {
//                 console.error('Fehler beim Lesen der Datei:', err);
//                 return
//             } else {
//                 let vmObject = new VMCode(additionRaw);
//                 let vmSequence = vmObject.additionMappedArray;
//                 arr.push(
//                     {
//                         'file': file,
//                         'vm': vmSequence
//                     }
//                 )
//             }
//         });
//     })

//     return arr;
// }





// ${project}/${folder}/${file}/${file2}


