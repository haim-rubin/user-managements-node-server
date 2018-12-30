import { template } from 'dot'
import fs from 'fs'

export const compile = (fileName) => {
    return  template(
        fs.readFileSync(fileName, 'utf8')
    )
}