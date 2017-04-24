const fs      = require('fs');
const emojic  = require('emojic');
const colorIt = require('color-it');
const utility = require('./utility');

class Charcoal {
    constructor(srcFile, destFile){
        this.srcFile       = srcFile;
        this.destFile      = destFile;
        this.srcFileData   = null;
        this.destFileData  = null;
        this.backupData    = null;
        this.jsRegex       = /(?:const|let|var){1} (\w+) = (?:'|")*((?:#*)[\w\(\),]+)(?:'|")*;*/i;
        this.scssRegex     = /\$(\w+): #*([\w\(\),]+);*/i;
        this.charcoalRegex = /\/+\*+\s*Charcoal Variables\s*\*+\/+/i;
    }


    run() {
        const { promiseWrap } = utility;
        const exists = promiseWrap(this.checkDestinationExists.bind(this))
            .then(()     => promiseWrap(this.backupDestinationFile.bind(this)))
            .then(()     => promiseWrap(this.readDestinationFile.bind(this)))
            .then(()     => promiseWrap(this.readSourceFile.bind(this)))
            .then(()     => promiseWrap(this.writeToDestinationFile.bind(this)))
            .then(done   => this.handleComplete(done))
            .catch(error => this.handleError(error));
    }

    backupDestinationFile(resolve, reject){
        // Load contents of the variable JS file
        const file = fs.readFile(this.destFile, 'utf8', (error, data) => {
            // If there is an error, reject it.
            if(error) { 
                reject(error);
            } else {
                this.backupData = data;
                resolve();
            }
        });
    }

    restoreDestinationBackup(){
        const lines = this.backupData.split('\n');
        const logger = fs.createWriteStream(this.destFile)

        // Write each variable passed in to the destFile, and format them as SCSS variables
        this.backupData.forEach((line, index) => {
            logger.write(`${ line }\n`);
        });

        resolve();
    }


    checkDestinationExists(resolve, reject) {
        fs.access(this.destFile, fs.constants.F_OK, (error) => {
            if(error) reject(error);
            resolve();
        })
    }


    extractVariablesFromData(data){
        const lines = data.split('\n');

       return lines.reduce((array, line) => {
            const variable = line.match(this.jsRegex);
            if(variable) array.push(variable);
            return array;
        }, []);
    }


    // Keep track of all the current lines written in the destination file.
    // These will need to be rewritten when JS variables are updated.
    extractNonCharcoalData(data){
        const lines = data.split('\n');
        let destinationFileLines = [];
        let foundLine = false;

        for(let index = 0; index < lines.length; index++) {
            const line = lines[index];

            if(foundLine) continue;
            if(line === '' && (index === lines.length - 1 || index === 0)) continue;

            const charcoalLine = line.match(this.charcoalRegex);

            if(charcoalLine) {
                destinationFileLines.push(line);
                foundLine = true;
            } else {
                destinationFileLines.push(line);
            }
        };

        return destinationFileLines;
    }


    readDestinationFile(resolve, reject) {
        // Load contents of the variable JS file
        const file = fs.readFile(this.destFile, 'utf8', (error, data) => {
            // If there is an error, reject it.
            if(error) { 
                reject(error);
            } else {
                this.destFileData = this.extractNonCharcoalData(data);
                resolve();
            }
        });
    }


    readSourceFile(resolve, reject) {
        // Load contents of the variable JS file
        const file = fs.readFile(this.srcFile, 'utf8', (error, data) => {
            // If there is an error, reject it.
            if(error) { 
                reject(error);
            } else {
                this.srcFileData = this.extractVariablesFromData(data);
                resolve();
            }
        });
    }


    writeToDestinationFile(resolve, reject){
        reject();
        const logger = fs.createWriteStream(this.destFile)

        // Write each variable passed in to the destFile, and format them as SCSS variables
        this.destFileData.forEach((line, index) => {
            logger.write(`${ line }\n`);
        })

        this.srcFileData.forEach((variable, index) => {
            logger.write(`${ utility.generateSCSSVariableString(variable[1], variable[2]) }${ index === this.srcFileData.length - 1 ? '' : '\n' }`);
        });

        resolve();
    }

    handleError(error){
        utility.promiseWrap(this.restoreDestinationBackup.bind(this)).then(() => {
            console.log(`${ colorIt('Charcoal Error:').alizarin() }`)
            console.log(`${ colorIt(error).alizarinBg() }`);
        });
    }


    handleComplete(){
        console.log(`${ colorIt('Charcoal copy completed.').greenBg() }`);
        console.log(`${ colorIt(`Wrote ${ this.srcFileData.length } variables to ${ this.destFile }`).greenBg() }`);
    }
}

module.exports = Charcoal;