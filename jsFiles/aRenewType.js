const Tools = require('./tools');
const ADB = require('./adbf');
var Kng = require("korean-name-generator");

async function main() {
    await ADB.type("ㄱ", 0, 1000, false);
    await ADB.type("ㅣ", 0, 1000, false);
    await ADB.type("ㅁ", 0, 1000, false);
    await ADB.type("ㄷ", 0, 1000, false);
    await ADB.type("ㅗ", 0, 1000, false);
    await ADB.type("ㅎ", 0, 1000, false);
    await ADB.type("ㅕ", 0, 1000, false);
    await ADB.type("ㅇ", 0, 1000, false);
}

main();