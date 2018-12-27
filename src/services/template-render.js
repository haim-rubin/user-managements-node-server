import dot from 'dot'
import { readFile } from '../utils/fs-util'


export const compileTemplate = dot.template

export const compile = (fileName) => {
    return readFile(fileName, 'utf8')
        .then((template) => {
            return compileTemplate(template)
        })
}

// var tempFn = doT.template("<h1>Here is a sample template {{=it.foo}}</h1>");
// 2. Use template function as many times as you like
// var resultText = tempFn({foo: 'with doT'}); 