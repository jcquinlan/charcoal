const fs = require('fs');
const process = require('process');
const emojic = require('emojic');
const colorIt = require('color-it');

/*
http://pythex.org/?regex=(%3F%3Aconst%7Clet%7Cvar)%7B1%7D%20%5Cw%2B%20%3D%20(%3F%3A%27%7C%22)*((%3F%3A%23*)%5B%5Cw%5C(%5C)%2C%5D%2B)(%3F%3A%27%7C%22)*%3B*&test_string=let%20breakpoint%20%3D%201990%0Aconst%20test%20%3D%20%27%2300ff45%27%0Alet%20anything_2%20%3D%20%27%2300ff45%27%3B%0Avar%20blahBlah%20%3D%20%27%2300ff45%27%3B%0Aconst%20blahBlah%20%3D%20%22%2300ff45%22%3B%0Aconst%20blah%20Blah%20%3D%20%22rgb(0%2C255%2C255)%22%3B%0Aconst%20blahBlah%20%3D%20%22rgb(0%2C255%2C255)%22%3B%0Aconst%20blahBlah%20%3D%20%22yellow%22%3B&ignorecase=0&multiline=0&dotall=0&verbose=0
*/
// See above link for Regex test.


class Charcoal {
    constructor(srcFile, destFile){
        this.srcFile = srcFile;
        this.destFile = destFile;
        // Regex to find variabled declarations.
        this.jsRegex = /(?:const|let|var){1} (\w+) = (?:'|")*((?:#*)[\w\(\),]+)(?:'|")*;*/;
        this.scssRegex = /\$(\w+): #*([\w\(\),]+);*/
        this.variables = [];
    }

    run(){
        this.gleenVariablesToCopy();
    }

    gleenVariablesToCopy() {
        const { srcFile, jsRegex } = this;
        const variables = [];

        fs.readFile(srcFile, 'utf8', (err, data) => {

            // Get each line of the JS variables files
            const lines = data.split('\n');

            // Parse each line using regex, and push variable onto temporary array
            lines.forEach(line => { 
                const variable = line.match(jsRegex, 'i');
                if(variable){
                    variables.push(variable);
                }
            })

            // After gleening all variables from the file, send them to the write method
            this.writeVariablesToDestFile(variables);

        })
    }

    writeVariablesToDestFile(variables){
        const { destFile } = this;
        const logger = fs.createWriteStream(destFile)

        // Write each variable passed in to the destFile, and format them as SCSS variables
        variables.forEach(variable => {
            logger.write(this.generateVariableString(variable));
        });

        logger.end();
        console.log(`${ colorIt('Charcoal copy completed.').wetAsphalt().greenBg() } ${ emojic.japaneseOgre }`)
    }

    generateVariableString(regexCapture){
        const name = regexCapture[1];
        const value = regexCapture[2];

        return `$${ name }: ${ value };\n`
    }
}

const srcFile = process.argv[2];
const destFile = process.argv[3];

let test = new Charcoal(srcFile, destFile);
test.run();

module.exports = Charcoal;