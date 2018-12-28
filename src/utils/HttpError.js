class HttpError extends Error {
    constructor(messageOrMessages, code){
        messageOrMessages = [].concat(messageOrMessages || [])
        
        const message = messageOrMessages.join('\n')
        
        super(message)
        Object
            .assign(
                this,
                { 
                    messageAll: message,
                    list: messageOrMessages,
                    code: code
                }
            )
       
        typeof Error.captureStackTrace === 'function' &&
            Error.captureStackTrace(this, this.constructor)
    }    
}

export default HttpError