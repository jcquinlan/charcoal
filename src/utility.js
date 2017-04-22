function promiseWrap(func, ...args){
    return new Promise((resolve, reject) => {
        func(resolve, reject, ...args);
    });
}

module.exports = promiseWrap;