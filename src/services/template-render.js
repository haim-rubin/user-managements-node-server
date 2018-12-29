import { template } from 'dot'
import { readFileSync } from '../utils/fs-util'
import fs from 'fs'

export const compile = (fileName) => {
    return  template(
        fs.readFileSync(fileName, 'utf8')
        )
}

// var tempFn = doT.template("<h1>Here is a sample template {{=it.foo}}</h1>");
// 2. Use template function as many times as you like
// var resultText = tempFn({foo: 'with doT'}); 