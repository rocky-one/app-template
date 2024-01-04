const os = require('os')

const getServerIp = () => {
    const interfaces = os.networkInterfaces()
    for (let dev in interfaces) {
        let iface = interfaces[dev]
        for (let i = 0; i < iface.length; i++) {
            let { family, address, internal } = iface[i]
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                return address
            }
        }
    }
}

const getClientIp = req => {
    let ip = req.headers['x-forwarded-for'] || req.ip;
    if (ip) {
        ip = ip.replace('::ffff:', '')
    }
    return ip;
}


module.exports = {
    getServerIp,
    getClientIp
}