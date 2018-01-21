const { readFile } = require('../utils/fs-utils')
const dot = require('dot')

const compileTemplate = (template) => {
    return dot.template(template)
}

const compile = (fileName) => {
    return readFile(fileName)
        .then((template) => {
            return compileTemplate(template)
        })
}

module.exports = { compile, compileTemplate }


// var tempFn = doT.template("<h1>Here is a sample template {{=it.foo}}</h1>");
// // 2. Use template function as many times as you like
// var resultText = tempFn({foo: 'with doT'}); 