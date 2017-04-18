const fs = require('fs');
const process = require('process');
const emojic = require('emojic');
const colorIt = require('color-it');

/*
http://pythex.org/?regex=(%3F%3Aconst%7Clet%7Cvar)%7B1%7D%20%5Cw%2B%20%3D%20(%3F%3A%27%7C%22)*((%3F%3A%23*)%5B%5Cw%5C(%5C)%2C%5D%2B)(%3F%3A%27%7C%22)*%3B*&test_string=let%20breakpoint%20%3D%201990%0Aconst%20test%20%3D%20%27%2300ff45%27%0Alet%20anything_2%20%3D%20%27%2300ff45%27%3B%0Avar%20blahBlah%20%3D%20%27%2300ff45%27%3B%0Aconst%20blahBlah%20%3D%20%22%2300ff45%22%3B%0Aconst%20blah%20Blah%20%3D%20%22rgb(0%2C255%2C255)%22%3B%0Aconst%20blahBlah%20%3D%20%22rgb(0%2C255%2C255)%22%3B%0Aconst%20blahBlah%20%3D%20%22yellow%22%3B&ignorecase=0&multiline=0&dotall=0&verbose=0
*/
// See above link for Regex test.

const destFile = '_variables.scss';
const file = process.argv[2];

class Charcoal {
    constructor(file, destFile){
        this.file = file;
        this.destFile = destFile;
        // Regex to find variabled declarations.
        this.regex = /(?:const|let|var){1} (\w+) = (?:'|")*((?:#*)[\w\(\),]+)(?:'|")*;*/;
        this.variables = [];
    }

    parse() {
        const { file, regex } = this;
        const variables = [];

        fs.readFile(file, 'utf8', (err, data) => {

            const lines = data.split('\n');

            lines.forEach(line => { 
                const variable = line.match(regex, 'i');
                if(variable){
                    variables.push(variable);
                }
            })

            this.writeVariablesToDestFile(variables);

        })
    }

    writeVariablesToDestFile(variables){
        const logger = fs.createWriteStream(destFile)

        variables.forEach(variable => {
            logger.write(this.generateVariableString(variable));
        });

        logger.end();
        console.log(`${ colorIt('Charcoal copy completed.').greenBg() } ${ emojic.japaneseOgre }`)
    }

    generateVariableString(regexCapture){
        const name = regexCapture[1];
        const value = regexCapture[2];

        return `$${ name }: ${ value }${ Number.isInteger(value) ? 'px' : ''};\n`
    }
}

let test = new Charcoal(file, destFile);
test.parse();