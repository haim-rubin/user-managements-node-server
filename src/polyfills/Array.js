Array.prototype.arrayPropToObject = function(initialObject = {}){
    return (
        this
            .reduce((obj, valueKeyPair) => ({
                ...obj,
                ...valueKeyPair
            }), initialObject)
    )
}

Array.prototype.flat = function(initialArray = []){
    return this.reduce((acc, item) => acc.concat(item), initialArray)
}

