import path from 'path'
const getAbsolutePath = (filePath, relDirname) => (
    path.isAbsolute(filePath)
        ? filePath
        : path.resolve(relDirname, filePath)
)

export default getAbsolutePath