const useragent = require('useragent')

const getClientIp = (req) => {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

const getUserAgentObject = (req) => (
    useragent
        .parse(req.headers['user-agent'])
)

module.exports = { getClientIp, getUserAgentObject }