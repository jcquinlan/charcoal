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
        this.destBackup    = null;
        this.jsRegex       = /(?:const|let|var){1} (\w+) = (?:'|")*((?:#*)[\w\(\),]+)(?:'|")*;*/i;
        this.scssRegex     = /\$(\w+): #*([\w\(\),]+);*/i;
        this.charcoalRegex = /\/+\*+\s*Charcoal Variables\s*\*+\/+/i;
        this.destIsFragile = false;
    }

    run() {
        const { promiseWrap } = utility;
        const exists = promiseWrap(this.backupFile.bind(this), this.destFile, 'destBackup')
            .then(()     => promiseWrap(this.readDestinationFile.bind(this)))
            .then(data   => promiseWrap(this.extractNonCharcoalData.bind(this), data))
            .then(()     => promiseWrap(this.readSourceFile.bind(this)))
            .then(data   => promiseWrap(this.extractVariablesFromData.bind(this), data))
            .then(()     => promiseWrap(this.writeToDestinationFile.bind(this)))
            .then(done   => this.handleComplete(done))
            .catch(error => this.handleError(error));
    }

    backupFile(resolve, reject, filePath, dataName){
        // Load contents of the variable JS file
        const file = fs.readFile(filePath, 'utf8', (error, data) => {
            if(error) {
                reject(error);
            } else {
                this[dataName] = data;
                resolve();
            }
        });
    }

    restoreDestinationBackup(resolve, reject){
        const lines = this.destBackup.split('\n');
        const logger = fs.createWriteStream(this.destFile)

        // Write each variable passed in to the destFile, and format them as SCSS variables
        lines.forEach((line, index) => {
            logger.write(`${ line }${ index != lines.length - 1 ? '\n' : '' }`);
        });

        resolve();
    }

    extractVariablesFromData(resolve, reject, data){
        const lines = data.split('\n');
        let sourceVariables = [];
        let foundCharcoalLine = false;

        for( let i = 0; i < lines.length; i++){
            const line = lines[i];
            const variable = line.match(this.jsRegex);
            if(variable) sourceVariables.push(variable);

            const charcoalLine = line.match(this.charcoalRegex);
            if(charcoalLine){
                if(foundCharcoalLine) reject('Source file contains multiple "/* charcoal variable */ lines. This is not allowed.');
                // sourceVariables is set to an empty array because we assume at the start that all variables will be translated into SCSS variables.
                // But if we find a line denoting the start of our charcoal variables, that means anything prior to that is not needed.
                // This only works assuming all variables below the special charcoal line need to translated.
                sourceVariables = [];
                foundCharcoalLine = true;
            }
        }

        this.srcFileData = sourceVariables;
        resolve();
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
                resolve(data);
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