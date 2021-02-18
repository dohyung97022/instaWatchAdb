// 이미지 인식형 + adb 입력으로 만들기
// 모든 브라우저에서 실험해보기

const Faker = require('faker');
const ADB = require('./adbf');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');

async function createGoogleAccount(setupFunction) {
    await ADB.lteOff();
    await ADB.lteOn();

    await setupFunction();
    await Tools.waitMilli(5000);
    await tapUntilImgFound(['../img/google/login.png', '../img/google/login2.png']);
    await Tools.waitMilli(2600);
    await tapUntilImgFound('../img/google/createAccount.png');
    await Tools.waitSec(1);
    await tapUntilImgFound('../img/google/myAccount.png');
    await Tools.waitMilli(1231);

    const firstName = Faker.name.firstName();
    const lastName = Faker.name.lastName();
    const email = Tools.getRandomFromArray([firstName, lastName]).toLowerCase() + Tools.getRandomLettersOfLenFromPool(5, '1234567890');
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
        await tapUntilImgFound('../img/google/userName.png');
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

    await Tools.waitMilli(2000);
    await tapUntilImgFound('../img/google/year.png');
    await ADB.typeBasic(Tools.getRandomNumberInRange(1970, 2001).toString(), 110, 600, false);
    await tapUntilImgFound('../img/google/month.png');
    await Tools.waitMilli(491);
    await ADB.tapLocation(550, Tools.getRandomNumberInRange(500, 1500));
    await tapUntilImgFound('../img/google/date.png');
    await ADB.typeBasic(Tools.getRandomNumberInRange(1, 30).toString(), 110, 600, false);
    await tapUntilImgFound('../img/google/sex.png');
    await ADB.tapLocation(550, 1230);
    await Tools.waitMilli(1241);
    await ADB.tapImage('../img/google/next.png');
    // 약관 이미지가 나올때까지 tap


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
    let retry = 50;
    var isDone = false;
    for (let i = 0; i < retry; i++) {
        await Tools.waitMilli(300);
        if (!isDone)
            isDone = await ADB.findImage('../img/google/logo.png');
        if (!isDone)
            isDone = await ADB.findImage('../img/google/logo2.png');
        else break;
    }
    const mysql = await Mysql.new();
    if (isDone)
        await mysql.exec(MysqlQuery.getInsertGoogleId(email, password, firstName, lastName));
    process.exit(1);
}

async function operaSetup() {
    await ADB.clearAppData('com.opera.browser');
    await Tools.waitSec(1);
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

async function firefoxSetup() {
    await ADB.clearAppData('org.mozilla.firefox');
    await ADB.openApp('org.mozilla.firefox');

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

async function test() {
    await createGoogleAccount(firefoxSetup);
    ADB.captureImage();
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


test();
// 이름 때문인가?
// 무엇 때문에 바로 막혔지???
// drag? 시간?




// // lte를 끄고 킵니다
// await ADB.lteOff();
// await Tools.waitSec(3);
// await ADB.lteOn();
// await Tools.waitSec(5);
// // 오페라 끄고 키기
// await ADB.clearAppData('com.opera.browser');
// await Tools.waitSec(3);
// await ADB.openApp('com.opera.browser');
// await Tools.waitSec(7);
// // 구글 들어가기
// await ADB.tapLocation(353, 472);
// await Tools.waitSec(1);
// await ADB.tapLocation(353, 472);
// await Tools.waitSec(2);
// // 위치 정도 엑세스 거부
// await ADB.tapLocation(676, 1420);
// await Tools.waitSec(2);
// // 로그인
// await ADB.tapLocation(890, 356);
// await Tools.waitSec(5);
// //계정 만들기
// await ADB.tapLocation(155, 1445);
// await waitRandom();
// //본인 계정
// await ADB.tapLocation(400, 1583);
// await Tools.waitMilli(1200);
// //성 영문이여도 된다.
// await ADB.tapLocation(163, 730);
// await waitRandom();
// //이름 영문이여도 된다.
// await ADB.tapLocation(155, 900);
// await waitRandom();
// //사용자 이름
// await ADB.tapLocation(161, 1085);
// await waitRandom();
// // 사용자 이름 오른쪽 끝
// await ADB.tapLocation(458, 1093);
// await waitRandom();
// // 삭제
// //벗어나기
// await ADB.tapLocation(876, 543);
// await waitRandom();
// // 드래그
// await ADB.swipe(840, 1320, 860, 1225, 100);
// await waitRandom();
// await ADB.swipe(840, 1320, 906, 1100, 100);
// await ADB.swipe(840, 1320, 906, 1100, 600);
// await waitRandom();
// // 비밀번호
// await ADB.tapLocation(224, 1106);
// await waitRandom();
// // 드래그
// await ADB.swipe(807, 885, 850, 500, 200);
// await waitRandom();
// // 비밀번호 확인
// await ADB.tapLocation(184, 655);
// await waitRandom();
// // 다음
// await ADB.tapLocation(902, 1110);
// await Tools.waitSec(8);
// // 드래그
// await ADB.swipe(754, 792, 820, 341, 250);
// await Tools.waitSec(1);
// // 연도
// await ADB.tapLocation(202, 1049);
// await waitRandom();
// // 월
// await ADB.tapLocation(523, 1048);
// await waitRandom();
// // 일
// await ADB.tapLocation(831, 1059);
// await waitRandom();
// // 탭
// await ADB.tapLocation(750, 680);
// await waitRandom();
// // 성별
// await ADB.tapLocation(560, 1298);
// await waitRandom();
// // 다음
// await ADB.tapLocation(886, 1712);
// await Tools.waitSec(7);
// await ADB.tapLocation(767, 984);
// await Tools.waitSec(1);
// // 드래그
// await ADB.swipe(575, 1325, 700, 800, 200);
// await ADB.swipe(791, 1124, 900, 500, 160);
// await ADB.swipe(601, 1200, 670, 652, 150);
// await ADB.swipe(642, 1352, 657, 925, 200);
// // 동의
// await ADB.tapLocation(115, 1205);
// await waitRandom();
// // 게인정보 제공동의
// await ADB.tapLocation(113, 1476);
// await waitRandom();
// // 계정 만들기
// await ADB.tapLocation(824, 1751);