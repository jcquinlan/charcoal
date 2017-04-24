function promiseWrap(func, ...args){
    return new Promise((resolve, reject) => {
        func(resolve, reject, ...args);
    });
}

function generateSCSSVariableString(name, value){
    return `$${ name }: ${ value };`
}

module.exports = {
    promiseWrap,
    generateSCSSVariableString,
}