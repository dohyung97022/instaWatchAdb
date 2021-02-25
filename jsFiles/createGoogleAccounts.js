const Faker = require('faker');
const ADB = require('./adbf');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');

async function createGoogleAccount(adb, device) {
    try {
        await device.setup(adb);

        await Tools.waitMilli(5000);
        await adb.tapUntilImgFound(device.googleImages.login);
        await Tools.waitMilli(2600);
        await adb.tapUntilImgFound(device.googleImages.createAccount);
        await Tools.waitSec(1);
        await adb.tapUntilImgFound(device.googleImages.myAccount);
        await Tools.waitMilli(1231);
        // Faker.setLocale('ko');
        // Setlocale을 하여도 regex가 설정되지 않았다면 불가능하다.
        const firstName = Faker.name.firstName().replace(/[^a-z0-9A-Z]/g, "");
        const lastName = Faker.name.lastName().replace(/[^a-z0-9A-Z]/g, "");
        const email = (Tools.getRandomFromArray([firstName, lastName]).toLowerCase() + Tools.getRandomLettersOfLenFromPool(6, '1234567890')).replace(/[^a-z0-9]/g, "");
        const password = Tools.getRandomLettersOfLenFromPool(8, '1234567890') + Tools.getRandomLettersOfLenFromPool(4, 'abcdefghijklmnopqrstuvwxyz');

        await adb.tapUntilImgFound(device.googleImages.firstName);
        await adb.type(firstName, device.typeMinInterval, device.typeMaxInterval, true);
        await adb.tapUntilImgFound(device.googleImages.lastName);
        await adb.type(lastName, device.typeMinInterval, device.typeMaxInterval, true);
        await Tools.waitMilli(4000);
        let newGmail = await adb.findImage(device.googleImages.newGmail);
        if (newGmail)
            await adb.tapUntilImgFound(device.googleImages.newGmail);
        let idIsEmpty = await adb.findImage(device.googleImages.userName);
        // if (!idIsEmpty) idIsEmpty = await adb.findImage(device.googleImages.userName2);
        if (!idIsEmpty) {
            await Tools.waitMilli(600);
            await adb.tapImage(device.googleImages.eraseName);
            await Tools.waitMilli(600);
            for (let i = 0; i < 25; i++) {
                await adb.delete();
            }
        }
        else {
            // await adb.tapUntilImgFound([device.googleImages.userName, device.googleImages.userName2]);
            await adb.tapUntilImgFound(device.googleImages.userName);
        }
        await adb.type(email, device.typeMinInterval, device.typeMaxInterval, true);

        await adb.tapUntilImgFound(device.googleImages.password);
        await adb.type(password, device.typeMinInterval, device.typeMaxInterval, true);
        await device.randomScrollDown(adb);
        await adb.tapUntilImgFound(device.googleImages.confirmPassword);
        await adb.type(password, device.typeMinInterval, device.typeMaxInterval, true);
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

        await device.dropdown(adb);

        await Tools.waitMilli(1241);
        await adb.tapImage(device.googleImages.next);

        for (let i = 0; i < 10; i++)
            await device.randomScrollDown(adb);

        await adb.tapUntilImgFound(device.googleImages.agreeServices);
        await adb.tapUntilImgFound(device.googleImages.agreeInformation);
        await adb.tapUntilImgFound(device.googleImages.createAccount2);
        await Tools.waitSec(5);

        // 구글 메인화면으로 왔다면 생성 완료
        let retry = 50;
        var isDone = false;
        for (let i = 0; i < retry; i++) {
            if (!isDone)
                isDone = await adb.findImage(device.googleImages.search);
            else break;
        }
        if (isDone) {
            const mysql = await Mysql.new();
            await mysql.exec(MysqlQuery.getInsertGoogleId(email, password, firstName, lastName, device.name, Tools.getCurrentDateTime()));
        }
        const currentApp = await adb.getCurrentApp();
        await adb.clearAppData(currentApp);
        return;
    }
    catch (e) {
        await adb.captureImage();
        console.log('error device = ' + device.name);
        console.log(e);
        return;
    }
}

const s10 = {
    name: 's10',
    typeMinInterval: 110,
    typeMaxInterval: 600,
    setup: async function (adb) {
        await adb.clearAppData('com.sec.android.app.sbrowser');
        await Tools.waitSec(5);
        await adb.openApp('com.sec.android.app.sbrowser');
        await adb.type('');

        await adb.tapUntilImgFound('../img/samsung/agree.png');
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/later.png');
        await adb.tapUntilImgFound('../img/samsung/settings.png');
        await adb.tapUntilImgFound('../img/samsung/lightMode.png');
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
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/s10/month.png');
        await waitRandom();
        await adb.swipe(550, 2100, 550, Tools.getRandomNumberInRange(1630, 2100), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1650, 2080));
        await adb.tapImage('../img/samsung/dropdownComplete.png');

        await adb.tapUntilImgFound('../img/google/s10/sex.png');
        await adb.tapImage('../img/samsung/dropdownDoNotShow.png');
        await adb.tapImage('../img/samsung/dropdownComplete.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1502, 1700),
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1000, 680), 500);
    },
    googleImages: {
        login: '../img/google/s10/login.png',
        createAccount: '../img/google/s10/createAccount.png',
        myAccount: '../img/google/s10/myAccount.png',
        firstName: '../img/google/s10/firstName.png',
        lastName: '../img/google/s10/lastName.png',
        userName: '../img/google/s10/userName.png',
        // userName2: '../img/google/s10/userName2.png',
        newGmail: '../img/google/s10/newGmail.png',
        eraseName: '../img/google/s10/eraseName.png',
        password: '../img/google/s10/password.png',
        confirmPassword: '../img/google/s10/confirmPassword.png',
        next: '../img/google/s10/next.png',
        phoneChoice: '../img/google/s10/phoneChoice.png',
        year: '../img/google/s10/year.png',
        date: '../img/google/s10/date.png',
        agreeServices: '../img/google/s10/agreeServices.png',
        agreeInformation: '../img/google/s10/agreeInformation.png',
        createAccount2: '../img/google/s10/createAccount2.png',
        search: '../img/google/s10/search.png'
    }
}
const note5 = {
    name: 'note5',
    typeMinInterval: 100,
    typeMaxInterval: 300,
    setup: async function (adb) {
        await adb.clearAppData('com.sec.android.app.sbrowser');
        await Tools.waitSec(5);
        await adb.openApp('com.sec.android.app.sbrowser');
        await adb.type('');

        await adb.tapUntilImgFound('../img/samsung/note5/agree.png');
        try {
            await adb.tapUntilImgFound('../img/samsung/note5/later.png');
        } catch (e) { }
        await adb.tapUntilImgFound('../img/samsung/note5/settings.png');
        await adb.tapUntilImgFound('../img/samsung/note5/options.png');
        await adb.swipe(550, 1800, 550, 0, 1000);
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/note5/personalInfo.png');
        await adb.tapUntilImgFound('../img/samsung/note5/userNameAndPassword.png');
        await adb.tapUntilImgFound('../img/samsung/note5/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/note5/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/note5/month.png');
        await waitRandom();
        await adb.swipe(550, 1800, 550, Tools.getRandomNumberInRange(1400, 1800), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1400, 1800));
        await adb.tapImage('../img/samsung/note5/dropdownComplete.png');
        await adb.tapUntilImgFound('../img/google/note5/sex.png');
        await adb.tapImage('../img/samsung/note5/dropdownDoNotShow.png');
        await adb.tapImage('../img/samsung/note5/dropdownComplete.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1502, 1700),
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(900, 680), 500);
    },
    googleImages: {
        login: '../img/google/note5/login.png',
        createAccount: '../img/google/note5/createAccount.png',
        myAccount: '../img/google/note5/myAccount.png',
        firstName: '../img/google/note5/firstName.png',
        lastName: '../img/google/note5/lastName.png',
        userName: '../img/google/note5/userName.png',
        // userName2: '../img/google/note5/userName2.png',
        newGmail: '../img/google/note5/newGmail.png',
        eraseName: '../img/google/note5/eraseName.png',
        password: '../img/google/note5/password.png',
        confirmPassword: '../img/google/note5/confirmPassword.png',
        next: '../img/google/note5/next.png',
        phoneChoice: '../img/google/note5/phoneChoice.png',
        year: '../img/google/note5/year.png',
        date: '../img/google/note5/date.png',
        agreeServices: '../img/google/note5/agreeServices.png',
        agreeInformation: '../img/google/note5/agreeInformation.png',
        createAccount2: '../img/google/note5/createAccount2.png',
        search: '../img/google/note5/search.png'
    }
}
const a5 = {
    name: 'a5',
    typeMinInterval: 100,
    typeMaxInterval: 300,
    setup: async function (adb) {
        await adb.clearAppData('com.android.chrome');
        await Tools.waitSec(5);
        await adb.openApp('com.android.chrome');
        await adb.type('');

        await adb.tapUntilImgFound('../img/chrome/a5/check.png');
        await adb.tapUntilImgFound('../img/chrome/a5/agreeAndContinue.png');
        await adb.tapUntilImgFound('../img/chrome/a5/skip.png');
        await adb.tapUntilImgFound('../img/chrome/a5/options.png');
        await adb.tapUntilImgFound('../img/chrome/a5/settings.png');
        await adb.tapUntilImgFound('../img/chrome/a5/savePassword.png');
        await adb.tapUntilImgFound('../img/chrome/a5/toggle.png');
        await adb.tapUntilImgFound('../img/chrome/a5/toggle.png');
        await adb.tapUntilImgFound('../img/chrome/a5/back.png');
        await adb.tapUntilImgFound('../img/chrome/a5/back.png');
        await adb.tapUntilImgFound('../img/chrome/a5/urlTab.png');
        await adb.typeBasic('www.google.co.kr');
        await adb.enter();
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/a5/month.png');
        await waitRandom();
        await adb.swipe(550, 1200, 550, Tools.getRandomNumberInRange(500, 1200), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1200, 100));
        await adb.swipe(
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(1100, 1250),
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(150, 250), 500);
        await adb.tapUntilImgFound('../img/google/a5/sex.png');
        await adb.tapImage('../img/samsung/a5/dropdownDoNotShow.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(950, 1100),
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(200, 400), 500);
    },
    googleImages: {
        login: '../img/google/a5/login.png',
        createAccount: '../img/google/a5/createAccount.png',
        myAccount: '../img/google/a5/myAccount.png',
        firstName: '../img/google/a5/firstName.png',
        lastName: '../img/google/a5/lastName.png',
        userName: '../img/google/a5/userName.png',
        // userName2: '../img/google/a5/userName2.png',
        newGmail: '../img/google/a5/newGmail.png',
        eraseName: '../img/google/a5/eraseName.png',
        password: '../img/google/a5/password.png',
        confirmPassword: '../img/google/a5/confirmPassword.png',
        next: '../img/google/a5/next.png',
        phoneChoice: '../img/google/a5/phoneChoice.png',
        year: '../img/google/a5/year.png',
        date: '../img/google/a5/date.png',
        agreeServices: '../img/google/a5/agreeServices.png',
        agreeInformation: '../img/google/a5/agreeInformation.png',
        createAccount2: '../img/google/a5/createAccount2.png',
        search: '../img/google/a5/search.png'
    }
}
const s6 = {
    name: 's6',
    typeMinInterval: 100,
    typeMaxInterval: 300,
    setup: async function (adb) {
        await adb.clearAppData('com.sec.android.app.sbrowser');
        await Tools.waitSec(5);
        await adb.openApp('com.sec.android.app.sbrowser');
        await adb.type('');
        await adb.tapUntilImgFound('../img/samsung/s6/agree.png');
        await adb.tapUntilImgFound('../img/samsung/s6/settings.png');
        await adb.tapUntilImgFound('../img/samsung/s6/options.png');
        await adb.swipe(720, 2500, 720, 0, 1000);
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/s6/personalInfo.png');
        await adb.swipe(720, 2500, 720, 0, 1000);
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/s6/userNameAndPassword.png');
        await adb.tapUntilImgFound('../img/samsung/s6/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/s6/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/s6/back.png');
        await adb.tapUntilImgFound('../img/samsung/s6/back.png');
        await adb.tapUntilImgFound('../img/samsung/s6/back.png');
        await adb.tapUntilImgFound('../img/samsung/s6/betweenUrl.png');
        await adb.typeBasic('www.google.co.kr');
        await adb.enter();
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/s6/month.png');
        await waitRandom();
        await adb.swipe(720, 2400, 720, Tools.getRandomNumberInRange(1800, 2400), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1800, 2400));
        await adb.tapImage('../img/samsung/s6/dropdownComplete.png');
        await adb.tapUntilImgFound('../img/google/s6/sex.png');
        await adb.tapImage('../img/samsung/s6/dropdownDoNotShow.png');
        await adb.tapImage('../img/samsung/s6/dropdownComplete.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(300, 1200),
            Tools.getRandomNumberInRange(2200, 2400),
            Tools.getRandomNumberInRange(300, 1200),
            Tools.getRandomNumberInRange(300, 700), 500);
    },
    googleImages: {
        login: '../img/google/s6/login.png',
        createAccount: '../img/google/s6/createAccount.png',
        myAccount: '../img/google/s6/myAccount.png',
        firstName: '../img/google/s6/firstName.png',
        lastName: '../img/google/s6/lastName.png',
        userName: '../img/google/s6/userName.png',
        // userName2: '../img/google/s6/userName2.png',
        newGmail: '../img/google/s6/newGmail.png',
        eraseName: '../img/google/s6/eraseName.png',
        password: '../img/google/s6/password.png',
        confirmPassword: '../img/google/s6/confirmPassword.png',
        next: '../img/google/s6/next.png',
        phoneChoice: '../img/google/s6/phoneChoice.png',
        year: '../img/google/s6/year.png',
        date: '../img/google/s6/date.png',
        agreeServices: '../img/google/s6/agreeServices.png',
        agreeInformation: '../img/google/s6/agreeInformation.png',
        createAccount2: '../img/google/s6/createAccount2.png',
        search: '../img/google/s6/search.png'
    }
}
const pocoM3 = {
    name: 'pocoM3',
    typeMinInterval: 100,
    typeMaxInterval: 200,
    setup: async function (adb) {
        await adb.clearAppData('com.sec.android.app.sbrowser');
        await Tools.waitSec(5);
        await adb.openApp('com.sec.android.app.sbrowser');
        await adb.type('');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/agree.png');
        await Tools.waitMilli(500);
        await adb.tapImage('../img/samsung/pocoM3/later.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/settings.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/options.png');
        await adb.swipe(540, 2100, 540, 0, 1000);
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/pocoM3/personalInfo.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/userNameAndPassword.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/back.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/back.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/back.png');
        await Tools.waitMilli(500);
        await adb.tapImage('../img/samsung/pocoM3/later.png');
        await adb.tapUntilImgFound('../img/samsung/pocoM3/betweenUrl.png');
        await adb.typeBasic('www.google.com');
        await adb.enter();

    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/pocoM3/month.png');
        await waitRandom();
        await adb.swipe(540, 2090, 540, Tools.getRandomNumberInRange(1800, 2090), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(540, Tools.getRandomNumberInRange(1680, 2090));
        await adb.tapImage('../img/samsung/pocoM3/dropdownComplete.png');
        await adb.tapUntilImgFound('../img/google/pocoM3/sex.png');
        await adb.tapImage('../img/samsung/pocoM3/dropdownDoNotShow.png');
        await adb.tapImage('../img/samsung/pocoM3/dropdownComplete.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(150, 900),
            Tools.getRandomNumberInRange(1800, 2050),
            Tools.getRandomNumberInRange(150, 900),
            Tools.getRandomNumberInRange(400, 700), 500);
    },
    googleImages: {
        login: '../img/google/pocoM3/login.png',
        createAccount: '../img/google/pocoM3/createAccount.png',
        myAccount: '../img/google/pocoM3/myAccount.png',
        firstName: '../img/google/pocoM3/firstName.png',
        lastName: '../img/google/pocoM3/lastName.png',
        userName: '../img/google/pocoM3/userName.png',
        // userName2: '../img/google/pocoM3/userName2.png',
        newGmail: '../img/google/pocoM3/newGmail.png',
        eraseName: '../img/google/pocoM3/eraseName.png',
        password: '../img/google/pocoM3/password.png',
        confirmPassword: '../img/google/pocoM3/confirmPassword.png',
        next: '../img/google/pocoM3/next.png',
        phoneChoice: '../img/google/pocoM3/phoneChoice.png',
        year: '../img/google/pocoM3/year.png',
        date: '../img/google/pocoM3/date.png',
        agreeServices: '../img/google/pocoM3/agreeServices.png',
        agreeInformation: '../img/google/pocoM3/agreeInformation.png',
        createAccount2: '../img/google/pocoM3/createAccount2.png',
        search: '../img/google/pocoM3/search.png'
    }
    // 참고
    // poco의 경우 adbkeybord를 사용하면 언어 및 입력에서 에러가 난다.
    // 직접 다시 돌려놓아야 한다.
    // await pocoAdb.setBasicKeyboard('com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME');

}

async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(400, 1500));
}

async function main() {
    const s10Code = 'R39M60041TD'
    const s10Adb = ADB.new(s10Code);

    const note5Code = '0915f948d3db1c05'
    const note5Adb = ADB.new(note5Code);

    // const a5Code = '4e05ca11'
    // const a5Adb = ADB.new(a5Code);

    const s6Code = '06157df644e02127'
    const s6Adb = ADB.new(s6Code);

    const pocoCode = '26b22a7d1120'
    const pocoAdb = ADB.new(pocoCode);

    for (let i = 0; i < 200; i++) {

        await s10Adb.lteOff();
        await s10Adb.lteOn();

        await s10Adb.unlock('9347314da');
        await createGoogleAccount(s10Adb, s10);
        await s10Adb.lock();

        await s10Adb.lteOff();
        await s10Adb.lteOn();

        await note5Adb.unlock();
        await createGoogleAccount(note5Adb, note5);
        await note5Adb.lock();

        // await s10Adb.lteOff();
        // await s10Adb.lteOn();

        // await a5Adb.unlock();
        // await createGoogleAccount(a5Adb, a5);
        // await a5Adb.lock();

        await s10Adb.lteOff();
        await s10Adb.lteOn();

        await s6Adb.unlock();
        await createGoogleAccount(s6Adb, s6);
        await s6Adb.lock();

        await s10Adb.lteOff();
        await s10Adb.lteOn();

        await pocoAdb.unlock();
        await createGoogleAccount(pocoAdb, pocoM3);
        await pocoAdb.setBasicKeyboard('com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME');
        await pocoAdb.lock();

        console.log('waiting...');
        await Tools.waitSec(Tools.getRandomNumberInRange(4600, 5600));
    }
}

async function test() {
    const pocoCode = '26b22a7d1120'
    const pocoAdb = ADB.new(pocoCode);
    await pocoAdb.unlock();
}



main();