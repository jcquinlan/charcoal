const process = require('process');
const Charcoal = require('./charcoalClass');

const srcFile = process.argv[2];
const destFile = process.argv[3];
const main = new Charcoal(srcFile, destFile);

main.run();