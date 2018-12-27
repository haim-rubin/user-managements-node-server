import useragent from 'useragent'

export const getClientIp = (req) => {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

export const getUserAgentObject = (req) => (
    useragent
        .parse(req.headers['user-agent'])
)