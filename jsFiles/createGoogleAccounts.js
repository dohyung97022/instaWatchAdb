const Faker = require('faker');
const ADB = require('./adbf');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');
const { time } = require('faker');

async function createGoogleAccount(setupFunction, dropdownFunction) {
    await ADB.lteOff();
    await ADB.lteOn();
    await setupFunction();

    await Tools.waitMilli(5000);
    await tapUntilImgFound(['../img/google/login.png', '../img/google/login2.png']);
    await Tools.waitMilli(2600);
    await tapUntilImgFound('../img/google/createAccount.png');
    await Tools.waitSec(1);
    // 가끔씩 안나올 때도 있다?
    await tapUntilImgFound('../img/google/myAccount.png');
    await Tools.waitMilli(1231);

    const firstName = Faker.name.firstName();
    const lastName = Faker.name.lastName();
    const email = (Tools.getRandomFromArray([firstName, lastName]).toLowerCase() + Tools.getRandomLettersOfLenFromPool(6, '1234567890')).replace(/[^a-z0-9]/g, "");
    const password = Tools.getRandomLettersOfLenFromPool(8, '1234567890') + Tools.getRandomLettersOfLenFromPool(4, 'abcdefghijklmnopqrstuvwxyz');

    await tapUntilImgFound('../img/google/firstName.png');
    await ADB.type(firstName, 110, 600, true);
    await tapUntilImgFound('../img/google/lastName.png');
    await ADB.type(lastName, 110, 600, true);
    await Tools.waitMilli(4000);

    let idIsEmpty = await ADB.findImage('../img/google/userName.png');
    if (!idIsEmpty) idIsEmpty = await ADB.findImage('../img/google/userName2.png');
    if (!idIsEmpty) {
        await Tools.waitMilli(600);
        await ADB.tapImage('../img/google/eraseName.png');
        await Tools.waitMilli(600);
        for (let i = 0; i < 25; i++) {
            await ADB.delete();
        }
    }
    else {
        await tapUntilImgFound(['../img/google/userName.png', '../img/google/userName2.png']);
    }
    await ADB.type(email, 110, 600, true);

    await tapUntilImgFound('../img/google/password.png');
    await ADB.type(password, 110, 600, true);
    await ADB.swipe(
        Tools.getRandomNumberInRange(250, 800),
        Tools.getRandomNumberInRange(1502, 1880),
        Tools.getRandomNumberInRange(250, 800),
        Tools.getRandomNumberInRange(1100, 780), 500);
    await tapUntilImgFound('../img/google/confirmPassword.png');
    await ADB.type(password, 110, 600, true);
    await Tools.waitMilli(313);
    await ADB.tapLocation(778, 1350);
    await Tools.waitMilli(452);
    await tapUntilImgFound('../img/google/next.png');
    await Tools.waitMilli(4000)

    // 이름 재입력
    const phoneChoice = await ADB.findImage('../img/google/phoneChoice.png');
    if (!phoneChoice) {
        console.log('this browser is temporary blocked');
        const clearApp = await ADB.getCurrentApp();
        await ADB.clearAppData(clearApp);
        return;
    }

    await tapUntilImgFound('../img/google/year.png');
    await ADB.typeBasic(Math.floor(Tools.getRandomNumberInRange(1970, 2001)), 110, 600, false);
    await tapUntilImgFound('../img/google/date.png');
    await ADB.typeBasic(Math.floor(Tools.getRandomNumberInRange(1, 30)), 110, 600, false);

    await dropdownFunction();

    await Tools.waitMilli(1241);
    await ADB.tapImage('../img/google/next.png');

    for (let i = 0; i < 10; i++)
        await ADB.swipe(
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1502, 1880),
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1100, 780), 500);


    await tapUntilImgFound('../img/google/agreeServices.png');
    await tapUntilImgFound('../img/google/agreeInformation.png');
    await tapUntilImgFound('../img/google/createAccount2.png');

    // 구글 메인화면으로 왔다면 생성 완료
    // 나중에도 포함시키기
    let retry = 50;
    var isDone = false;
    for (let i = 0; i < retry; i++) {
        await Tools.waitMilli(300);
        if (!isDone)
            isDone = await ADB.findImage('../img/google/logo.png');
        if (!isDone)
            isDone = await ADB.findImage('../img/google/logo2.png');
        if (!isDone)
            isDone = await ADB.findImage('../img/google/logo3.png');
        if (!isDone)
            isDone = await ADB.findImage('../img/google/accountCheck.png');
        else break;
    }
    const mysql = await Mysql.new();
    if (isDone)
        await mysql.exec(MysqlQuery.getInsertGoogleId(email, password, firstName, lastName));
    const currentApp = await ADB.getCurrentApp();
    await ADB.clearAppData(currentApp);
    return;
    // process.exit(1);
}

// confirmed
async function operaSetup() {
    await ADB.clearAppData('com.opera.browser');
    await Tools.waitSec(5);
    await ADB.openApp('com.opera.browser');
    await ADB.type('');

    // 테마 선택
    await tapUntilImgFound('../img/opera/theamSelect.png');
    // 오페라 옵션
    await tapUntilImgFound('../img/opera/options.png');
    // 옵션 들어가기
    await tapUntilImgFound('../img/opera/settings.png');
    // 야간모드
    await tapUntilImgFound('../img/opera/nightMode.png');
    // 뒤로
    await tapUntilImgFound('../img/opera/menuBack.png');
    // 비밀번호
    await tapUntilImgFound('../img/opera/password.png');
    // 비밀번호 저장 설정
    await tapUntilImgFound('../img/opera/savePassword.png');
    // 안함
    await tapUntilImgFound('../img/opera/passwordSaveNo.png');
    // 뒤로
    await tapUntilImgFound('../img/opera/menuBack.png');
    // 아래로
    await ADB.swipe(550, 2000, 550, 0, 1000);
    await ADB.swipe(550, 2000, 550, 0, 1000);
    await ADB.swipe(550, 2000, 550, 0, 1000);
    // 사이트 설정
    await tapUntilImgFound('../img/opera/siteSettings.png');
    // 위치
    await tapUntilImgFound('../img/opera/location.png');
    // 위치 설졍
    await tapUntilImgFound('../img/opera/setLocation.png');
    // 거부
    await tapUntilImgFound('../img/opera/locationNo.png');
    // 뒤로
    await tapUntilImgFound('../img/opera/menuBack.png');
    // 뒤로
    await tapUntilImgFound('../img/opera/menuBack.png');
    // 뒤로
    await tapUntilImgFound('../img/opera/menuBack.png');
    // 구글
    await tapUntilImgFound('../img/opera/google.png');
}
async function operaDropdown() {
    await tapUntilImgFound('../img/google/month.png');
    await waitRandom();
    await ADB.tapLocation(550, Tools.getRandomNumberInRange(500, 1500));

    await tapUntilImgFound('../img/google/sex.png');
    await ADB.tapLocation(550, 1230);
}


async function firefoxSetup() {
    await ADB.clearAppData('org.mozilla.firefox');
    await Tools.waitSec(5);
    await ADB.openApp('org.mozilla.firefox');
    await ADB.type('');

    await tapUntilImgFound('../img/firefox/more.png');
    await tapUntilImgFound('../img/firefox/settings.png');
    await tapUntilImgFound('../img/firefox/loginSettings.png');
    await tapUntilImgFound('../img/firefox/loginSave.png');
    await tapUntilImgFound('../img/firefox/doNotSave.png');
    await tapUntilImgFound('../img/firefox/back.png');
    await tapUntilImgFound('../img/firefox/back.png');
    await tapUntilImgFound('../img/firefox/back.png');

    await tapUntilImgFound('../img/firefox/google.png');
    await ADB.typeBasic('www.google.com', 1, 1, false);
    await ADB.enter();
}
async function firefoxDropdown() {
    await tapUntilImgFound('../img/google/month.png');
    await waitRandom();
    await ADB.tapLocation(550, Tools.getRandomNumberInRange(500, 1500));

    await tapUntilImgFound('../img/google/sex.png');
    await ADB.tapLocation(550, 1230);
}

// confirmed
async function samsungSetup() {
    await ADB.clearAppData('com.sec.android.app.sbrowser');
    await Tools.waitSec(5);
    await ADB.openApp('com.sec.android.app.sbrowser');
    await ADB.type('');

    await tapUntilImgFound('../img/samsung/agree.png');
    await tapUntilImgFound('../img/samsung/later.png');
    await tapUntilImgFound('../img/samsung/settings.png');
    await tapUntilImgFound('../img/samsung/lightMode.png');
    await tapUntilImgFound('../img/samsung/settings.png');
    await tapUntilImgFound('../img/samsung/options.png');
    await ADB.swipe(550, 2000, 550, 0, 1000);
    await Tools.waitMilli(500);
    await tapUntilImgFound('../img/samsung/personalInfo.png');
    await tapUntilImgFound('../img/samsung/userNameAndPassword.png');
    await tapUntilImgFound('../img/samsung/toggle.png');
    await tapUntilImgFound('../img/samsung/toggle.png');
    await tapUntilImgFound('../img/samsung/back.png');
    await tapUntilImgFound('../img/samsung/back.png');
    await tapUntilImgFound('../img/samsung/back.png');
    await tapUntilImgFound('../img/samsung/betweenUrl.png');
    await ADB.typeBasic('www.google.com');
    await ADB.enter();
}
async function samsungDropdown() {
    await tapUntilImgFound('../img/google/month.png');
    await waitRandom();
    await ADB.swipe(550, 2100, 550, Tools.getRandomNumberInRange(1630, 2100), 200);
    await Tools.waitSec(3);
    await ADB.tapLocation(550, Tools.getRandomNumberInRange(1650, 2080));
    await ADB.tapImage('../img/samsung/dropdownComplete.png');

    await tapUntilImgFound('../img/google/sex.png');
    await ADB.tapImage('../img/samsung/dropdownDoNotShow.png');
    await ADB.tapImage('../img/samsung/dropdownComplete.png');
}


async function duckduckgoSetup() {
    await ADB.clearAppData('com.duckduckgo.mobile.android');
    await Tools.waitSec(4);
    await ADB.openApp('com.duckduckgo.mobile.android');
    await ADB.type('');
    await tapUntilImgFound('../img/duckduckgo/letsDoIt.png');
    await tapUntilImgFound('../img/duckduckgo/cancel.png');
    await tapUntilImgFound('../img/duckduckgo/options.png');
    await tapUntilImgFound('../img/duckduckgo/settings.png');
    await tapUntilImgFound('../img/duckduckgo/autocomplete.png');
    await tapUntilImgFound('../img/duckduckgo/back.png');
    await ADB.typeBasic('www.google.com');
    await ADB.enter();
    await tapUntilImgFound('../img/duckduckgo/gotIt.png');
    await Tools.waitMilli(500);
    await ADB.tapLocation(550, 1200);
}
async function duckduckDropdown() {
    await tapUntilImgFound('../img/google/month.png');
    await waitRandom();
    await ADB.tapLocation(550, Tools.getRandomNumberInRange(500, 1500));

    await tapUntilImgFound('../img/google/sex.png');
    await ADB.tapLocation(550, 1230);
}

// confirmed
async function edgeSetup() {
    await ADB.clearAppData('com.microsoft.emmx');
    await Tools.waitSec(4);
    await ADB.openApp('com.microsoft.emmx');
    await ADB.type('');
    await tapUntilImgFound('../img/edge/skip.png');
    await tapUntilImgFound('../img/edge/later.png');
    await tapUntilImgFound('../img/edge/later.png');
    await tapUntilImgFound('../img/edge/browserSetNo.png');
    await tapUntilImgFound('../img/edge/options.png');
    await tapUntilImgFound('../img/edge/settings.png');
    await tapUntilImgFound('../img/edge/savePassword.png');
    await tapUntilImgFound('../img/edge/toggle.png');
    await tapUntilImgFound('../img/edge/tab.png');
    await tapUntilImgFound('../img/edge/back.png');
    await tapUntilImgFound('../img/edge/back.png');
    await tapUntilImgFound('../img/edge/webAdressInput.png');
    await ADB.typeBasic('www.google.com');
    await ADB.enter();
}
async function edgeDropdown() {
    await tapUntilImgFound('../img/google/month.png');
    await waitRandom();
    await ADB.tapLocation(550, Tools.getRandomNumberInRange(500, 1500));

    await tapUntilImgFound('../img/google/sex.png');
    await ADB.tapLocation(550, 1230);
}


async function main() {
    await ADB.setBrightness(106);
    // @기호를 포함해야 합니다.
    // 브라우저마다 범위 선택의 위치가 다르다.
    // range를 변수로 추가하기
    for (let i = 0; i < 200; i++) {
        // await createGoogleAccount(operaSetup, operaDropdown);
        // await createGoogleAccount(firefoxSetup, firefoxDropdown);
        await createGoogleAccount(samsungSetup, samsungDropdown);
        // await createGoogleAccount(edgeSetup, edgeDropdown);
    }
}

async function tapUntilImgFound(img) {
    await Tools.waitMilli(Tools.getRandomNumberInRange(300, 800));
    var imageFound = false;
    if (Array.isArray(img)) {
        while (!imageFound)
            for (let i = 0; i < img.length; i++) {
                imageFound = await ADB.tapImage(img[i]);
                if (imageFound) return;
            }
    } else {
        while (!imageFound)
            imageFound = await ADB.tapImage(img);
    }

    await Tools.waitMilli(Tools.getRandomNumberInRange(523, 1500));
}

async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(400, 1500));
}


main();