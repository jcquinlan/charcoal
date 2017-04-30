const process = require('process');
const Charcoal = require('./class');

if(process.argv.length > 4){
    console.error('Charcoal takes only 2 arguments: a source JS file, and a destination SCSS file.')
    console.error(`Unknown argument: ${ process.argv[4] }`);
} else {
    const srcFile = process.argv[2];
    const destFile = process.argv[3];

    const main = new Charcoal(srcFile, destFile);

    main.run();
}