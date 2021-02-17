// 이미지 인식형 + adb 입력으로 만들기
// 모든 브라우저에서 실험해보기


const ADB = require('./adbf');
const Tools = require('./tools');

async function createGoogleAccount(setupFunction) {
    await ADB.lteOff();
    await Tools.waitSec(3);
    await ADB.lteOn();
    await Tools.waitSec(5);

    await setupFunction();

    var imageFound = false;
    while (!imageFound) {
        imageFound = await ADB.findImage('../img/google/login.png');
    }

    await ADB.tapImage('../img/google/login.png');
}
async function operaSetup() {
    var imageFound;

    await ADB.clearAppData('com.opera.browser');
    await Tools.waitSec(1);
    await ADB.openApp('com.opera.browser');

    // 테마 선택
    await tapUntilImgFound('../img/operaTheamSelect.png');
    // 오페라 옵션
    await tapUntilImgFound('../img/operaOptions.png');
    // 옵션 들어가기
    await tapUntilImgFound('../img/operaSettings.png');
    // 아래로
    await ADB.swipe(550, 2000, 550, 0, 1000);
    await ADB.swipe(550, 2000, 550, 0, 1000);
    await ADB.swipe(550, 2000, 550, 0, 1000);
    // 사이트 설정
    await tapUntilImgFound('../img/operaSiteSettings.png');
    // 위치
    await tapUntilImgFound('../img/operaLocation.png');
    // 위치 설졍
    await tapUntilImgFound('../img/operaSetLocation.png');
    // 거부
    await tapUntilImgFound('../img/operaLocationNo.png');
}

async function test() {
    await ADB.captureImage();

}

async function tapUntilImgFound(img) {
    var imageFound = false;
    while (!imageFound) {
        imageFound = await ADB.tapImage(img);
    }
}

async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(400, 1500));
}


test();




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