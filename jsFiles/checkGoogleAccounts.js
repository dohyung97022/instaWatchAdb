const ADB = require('./adbf');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');
const prompt = require('prompt-sync')();

async function createGoogleAccount(adb, device) {
    try {
        await device.samsungSetup(adb);

        await Tools.waitMilli(5000);
        await adb.tapUntilImgFound(device.googleImages.login);
        await Tools.waitMilli(2600);
        await adb.tapUntilImgFound(device.googleImages.createAccount);
        await Tools.waitSec(1);
        // 가끔씩 안나올 때도 있다?
        await adb.tapUntilImgFound(device.googleImages.myAccount);
        await Tools.waitMilli(1231);

        const firstName = Faker.name.firstName().replace(/[^a-z0-9A-Z]/g, "");
        const lastName = Faker.name.lastName().replace(/[^a-z0-9A-Z]/g, "");
        const email = (Tools.getRandomFromArray([firstName, lastName]).toLowerCase() + Tools.getRandomLettersOfLenFromPool(6, '1234567890')).replace(/[^a-z0-9]/g, "");
        const password = Tools.getRandomLettersOfLenFromPool(8, '1234567890') + Tools.getRandomLettersOfLenFromPool(4, 'abcdefghijklmnopqrstuvwxyz');

        await adb.tapUntilImgFound(device.googleImages.firstName);
        await adb.type(firstName, 110, 600, true);
        await adb.tapUntilImgFound(device.googleImages.lastName);
        await adb.type(lastName, 110, 600, true);
        await Tools.waitMilli(4000);

        let idIsEmpty = await adb.findImage(device.googleImages.userName);
        if (!idIsEmpty) idIsEmpty = await adb.findImage(device.googleImages.userName2);
        if (!idIsEmpty) {
            await Tools.waitMilli(600);
            await adb.tapImage(device.googleImages.eraseName);
            await Tools.waitMilli(600);
            for (let i = 0; i < 25; i++) {
                await adb.delete();
            }
        }
        else {
            await adb.tapUntilImgFound([device.googleImages.userName, device.googleImages.userName2]);
        }
        await adb.type(email, 110, 600, true);

        await adb.tapUntilImgFound(device.googleImages.password);
        await adb.type(password, 110, 600, true);
        await device.randomScrollDown(adb);
        await adb.tapUntilImgFound(device.googleImages.confirmPassword);
        await adb.type(password, 110, 600, true);
        await Tools.waitMilli(1200);
        await adb.tapUntilImgFound(device.googleImages.next);
        await Tools.waitMilli(4000)

        // 이름 재입력
        const phoneChoice = await adb.findImage(device.googleImages.phoneChoice);
        if (!phoneChoice) {
            console.log('this browser is temporary blocked');
            const clearApp = await adb.getCurrentApp();
            await adb.clearAppData(clearApp);
            return;
        }

        await adb.tapUntilImgFound(device.googleImages.year);
        await adb.typeBasic(Math.floor(Tools.getRandomNumberInRange(1970, 2001)), 110, 600, false);
        await adb.tapUntilImgFound(device.googleImages.date);
        await adb.typeBasic(Math.floor(Tools.getRandomNumberInRange(1, 30)), 110, 600, false);

        await device.samsungDropdown(adb);

        await Tools.waitMilli(1241);
        await adb.tapImage(device.googleImages.next);

        for (let i = 0; i < 10; i++)
            await device.randomScrollDown(adb);

        await adb.tapUntilImgFound(device.googleImages.agreeServices);
        await adb.tapUntilImgFound(device.googleImages.agreeInformation);
        await adb.tapUntilImgFound(device.googleImages.createAccount2);
        await Tools.waitSec(5);

        // 구글 메인화면으로 왔다면 생성 완료
        // 나중에도 포함시키기
        // let retry = 50;
        // var isDone = false;
        // for (let i = 0; i < retry; i++) {
        //     if (!isDone)
        //         isDone = await adb.findImage('../img/google/logo.png');
        //     else break;
        // }
        const mysql = await Mysql.new();
        // if (isDone)
        await mysql.exec(MysqlQuery.getInsertGoogleId(email, password, firstName, lastName));
        const currentApp = await adb.getCurrentApp();
        await adb.clearAppData(currentApp);
        return;
    }
    catch (e) {
        console.log(e);
        return;
    }
}
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
    for (let i = 5; i < allGoogleIds.length; i++) {
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