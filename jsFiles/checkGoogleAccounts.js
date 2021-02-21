const ADB = require('./adbf');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');
const prompt = require('prompt-sync')();

async function samsungSetup(adb) {
    await adb.clearAppData('com.sec.android.app.sbrowser');
    await Tools.waitSec(5);
    await adb.openApp('com.sec.android.app.sbrowser');
    await adb.type('');

    await adb.tapUntilImgFound('../img/samsung/agree.png');
    await Tools.waitMilli(500);
    await adb.tapUntilImgFound('../img/samsung/later.png');
    await adb.tapUntilImgFound('../img/samsung/settings.png');
    await adb.tapUntilImgFound('../img/samsung/options.png');
    await adb.swipe(550, 2000, 550, 0, 1000);
    await Tools.waitMilli(500);
    await adb.tapUntilImgFound('../img/samsung/personalInfo.png');
    await adb.tapUntilImgFound('../img/samsung/userNameAndPassword.png');
    await adb.tapUntilImgFound('../img/samsung/toggle.png');
    await adb.tapUntilImgFound('../img/samsung/toggle.png');
    await adb.tapUntilImgFound('../img/samsung/back.png');
    await adb.tapUntilImgFound('../img/samsung/back.png');
    await adb.tapUntilImgFound('../img/samsung/back.png');
    await adb.tapUntilImgFound('../img/samsung/betweenUrl.png');
    await adb.typeBasic('www.google.com');
    await adb.enter();
}

async function main() {
    var mysql = await Mysql.new();
    const allGoogleIds = await mysql.get(MysqlQuery.getGoogleIds());
    // const newDeviceIpId = '192.168.43.1:5555'
    const newDeviceId = 'R39M60041TD'
    const newAdb = ADB.new(newDeviceId);
    await newAdb.captureImage();
    for (let i = 0; i < allGoogleIds.length; i++) {
        await newAdb.lteOff();
        await newAdb.lteOn();
        await samsungSetup(newAdb);

        await newAdb.tapUntilImgFound('../img/google/s10/darkLogin.png');
        await newAdb.tapUntilImgFound('../img/google/s10/darkLoginInput.png');
        await newAdb.type(allGoogleIds[i].id);
        await waitRandom();
        await newAdb.tapUntilImgFound('../img/google/s10/darkNext.png');
        await newAdb.tapUntilImgFound('../img/google/s10/darkPasswordInput.png');
        await newAdb.type(allGoogleIds[i].password);
        await newAdb.tapUntilImgFound('../img/google/s10/darkNext.png');
        await newAdb.setBasicKeyboard('com.samsung.android.honeyboard/.service.HoneyBoardService');
        await Tools.waitSec(5);
        var isIdBlocked = await newAdb.findImage('../img/google/s10/darkLoginVarify.png');
        if (isIdBlocked) {
            mysql = await Mysql.new();
            await mysql.exec(MysqlQuery.getRemoveGoogleId(allGoogleIds[i].id));
        }
    }
}

async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(400, 1500));
}

main();