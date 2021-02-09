var https = require('https');

module.exports.getIp = async function () {
    const ipAddress = await new Promise(resolve => {
        https.get("https://api.ipify.org", function (resp) {
            resp.on('data', (address) => {
                resolve(address);
            });
        });
    })
    return ipAddress;
}