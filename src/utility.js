function promiseWrap(func, ...args){
    return new Promise((resolve, reject) => {
        func(resolve, reject, ...args);
    });
}

function generateSCSSVariableString(name, value){
    return `$${ name }: ${ value };`
}

function checkFileExists(resolve, reject, file) {
    fs.access(file, fs.constants.F_OK, (error) => {
        if(error) reject(error);
        resolve();
    });
}

module.exports = {
    promiseWrap,
    generateSCSSVariableString,
    checkFileExists,
}