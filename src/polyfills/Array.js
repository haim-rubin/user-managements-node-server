Array.prototype.arrayPropToObject = function(initialObject = {}){
    return (
        this
            .reduce((obj, valueKeyPair) => ({
                ...obj,
                ...valueKeyPair
            }), initialObject)
    )
}