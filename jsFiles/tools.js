const fs = require('fs').promises;
const path = require('path');

//get

//getStringFromFile
module.exports.getStringFromFile = async function (location) {
    const cookiesString = await fs.readFile(location, 'utf-8');
    return cookiesString;
}

//getStringBetween
module.exports.getStringBetween = function (original, from, to) {
    return original.match(new RegExp(from + "([\\s\\S]*)" + to))[1];
    // return original.substring(original.lastIndexOf(from) + 1, original.lastIndexOf(to));
}


//getJsonFromFile
module.exports.getJsonFromFile = async function (location) {
    const cookiesString = await fs.readFile(location);
    const cookiesRead = JSON.parse(cookiesString);
    return cookiesRead;
}


//getJsonFromString
module.exports.getJsonFromString = async function (string) {
    const cookiesRead = JSON.parse(string);
    return cookiesRead;
}

//getRandomfromArray
module.exports.getRandomFromArray = function (array) {
    return array[Math.floor(Math.random() * array.length)];
}

//getRandomRemovedFromArray
module.exports.getRandomRemovedFromArray = function (array) {
    const idx = Math.floor(Math.random() * array.length);
    return array.splice(idx, 1)[0];
}

//getCurrentFileName
module.exports.getCurrentFileName = function () {
    return path.basename(__filename);
}

//getCurrentDateTime
module.exports.getCurrentDateTime = function () {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

//getRandomLettersOfLen
module.exports.getRandomLettersOfLen = function (length) {
    var result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++)
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    return result;
}

//getRandomLettersOfLenFromPool
module.exports.getRandomLettersOfLenFromPool = function (length, letterPool) {
    var result = '';
    for (var i = 0; i < length; i++)
        result += letterPool.charAt(Math.floor(Math.random() * letterPool.length));
    return result;
}

//getRandomHangul
// module.exports.getRandomHangul = function () {
//     return String.fromCharCode(44031 + Math.ceil(11172 * Math.random()));
// }

//getRandomHangul
// module.exports.getRandomHangulName = function () {
//     let name = '';
//     for (let i = 0; i < 3; i++) {
//         name += String.fromCharCode(44031 + Math.ceil(11172 * Math.random()));
//     }
//     return name;
// }

module.exports.waitSec = async function (seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


var countLoggerCounter = 0;
module.exports.countLogger = function () {
    console.log(countLoggerCounter);
    countLoggerCounter++;
}