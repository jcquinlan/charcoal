const fs          = require('fs');
const emojic      = require('emojic');
const colorIt     = require('color-it');
const promiseWrap = require('./utility');

class Charcoal {
    constructor(srcFile, destFile){
        this.srcFile    = srcFile;
        this.destFile   = destFile;
        this.jsRegex    = /(?:const|let|var){1} (\w+) = (?:'|")*((?:#*)[\w\(\),]+)(?:'|")*;*/;
        this.scssRegex  = /\$(\w+): #*([\w\(\),]+);*/
    }

    run() {
        const exists = promiseWrap(this.checkDestExists.bind(this))
            .then(res => promiseWrap(this.readSourceFile.bind(this)))
            .then(variables => promiseWrap(this.writeVariablesToDestFile.bind(this), variables))
            .then((done) => this.handleComplete(done))
            .catch(error => this.handleError(error));
    }

    checkDestExists(resolve, reject) {
        fs.access(this.destFile, fs.constants.F_OK, (error) => {
            if(error) reject(error);
            resolve();
        })
    }

    extractVariablesFromData(data){
        const lines = data.split('\n');

       return lines.reduce((array, line) => {
            const variable = line.match(this.jsRegex, 'i');
            if(variable) array.push(variable);
            return array;
        }, []);
    }

    readSourceFile(resolve, reject) {
        // Load contents of the variable JS file
        const file = fs.readFile(this.srcFile, 'utf8', (error, data) => {
            // If there is an error, reject it.
            if(error) { 
                reject(error);
            } else {
                resolve(this.extractVariablesFromData(data));
            }
        });
    }

    writeVariablesToDestFile(resolve, reject, variables){
        const { destFile } = this;
        const logger = fs.createWriteStream(destFile)

        // Write each variable passed in to the destFile, and format them as SCSS variables
        variables.forEach(variable => {
            logger.write(this.generateSCSSVariableString(variable));
        });

        logger.end();
        resolve(`Wrote ${ variables.length } variables to ${ this.destFile }`);
    }

    generateSCSSVariableString(regexCapture){
        const name = regexCapture[1];
        const value = regexCapture[2];

        return `$${ name }: ${ value };\n`
    }

    handleError(error){
        console.log(`${ colorIt('Charcoal Error:').alizarin() }`)
        console.log(`${ colorIt(error).alizarinBg() }`);
    }

    handleComplete(message){
        console.log(`${ colorIt('Charcoal copy completed.').greenBg() }`);
        console.log(`${ colorIt(message).greenBg() }`);
    }
}

module.exports = Charcoal;