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
        this.destIsFragile = false;
    }

    run() {
        const { promiseWrap } = utility;
        const exists = promiseWrap(this.backupDestinationFile.bind(this))
            .then(()     => promiseWrap(this.readDestinationFile.bind(this)))
            .then(data   => promiseWrap(this.extractNonCharcoalData.bind(this), data))
            .then(()     => promiseWrap(this.readSourceFile.bind(this)))
            .then(()     => promiseWrap(this.writeToDestinationFile.bind(this)))
            .then(done   => this.handleComplete(done))
            .catch(error => this.handleError(error));
    }

    backupDestinationFile(resolve, reject){
        // Load contents of the variable JS file
        const file = fs.readFile(this.destFile, 'utf8', (error, data) => {
            if(error) {
                reject(error);
            } else {
                this.backupData = data;
                resolve();
            }
        });
    }

    restoreDestinationBackup(resolve, reject){
        const lines = this.backupData.split('\n');
        const logger = fs.createWriteStream(this.destFile)

        // Write each variable passed in to the destFile, and format them as SCSS variables
        lines.forEach((line, index) => {
            logger.write(`${ line }${ index != lines.length - 1 ? '\n' : '' }`);
        });

        resolve();
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
    extractNonCharcoalData(resolve, reject, data){
        const lines = data.split('\n');
        let destinationFileLines = [];
        let foundCharcoalLine = false;

        for(let index = 0; index < lines.length; index++) {
            const line = lines[index];

            if(foundCharcoalLine) continue;
            if(line === '' && (index === lines.length - 1 || index === 0)) continue;

            const charcoalLine = line.match(this.charcoalRegex);

            if(charcoalLine) {
                destinationFileLines.push(line);
                foundCharcoalLine = true;
            } else {
                destinationFileLines.push(line);
            }
        };

        if(foundCharcoalLine){
            this.destIsFragile = true;
        }

        this.destFileData = destinationFileLines;
        resolve();
    }

    readDestinationFile(resolve, reject) {
        // Load contents of the variable JS file
        const file = fs.readFile(this.destFile, 'utf8', (error, data) => {
            // If there is an error, reject it.
            if(error) { 
                reject(error);
            } else {
                resolve(data);
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
        const logger = fs.createWriteStream(this.destFile)

        // Write each variable passed in to the destFile, and format them as SCSS variables
        if(this.destIsFragile){
            this.destFileData.forEach((line, index) => {
                logger.write(`${ line }\n`);
            });
        }

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