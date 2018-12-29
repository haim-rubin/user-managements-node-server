import fs from 'fs'
import util from 'util'

export const readFile = util.promisify(fs.readFile)
export const readFileSync = util.promisify(fs.readFileSync)