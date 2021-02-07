const fs = require('fs').promises;

//get

//getStringFromFile
module.exports.getStringFromFile = async function (location) {
    const cookiesString = await fs.readFile(location, 'utf-8');
    return cookiesString;
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

var countLoggerCounter = 0;
module.exports.countLogger = function () {
    console.log(countLoggerCounter);
    countLoggerCounter++;
}