const ADB = require('./adbf');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');

async function followInstagram(adb, device) {
    try {
        // 1. mysql에서 가장 오래 행동되지 않은 아이디를 가져온다.
        const mysql = await Mysql.new();
        let instagramAccount = await mysql.get(MysqlQuery.getMostWaitedInstagramAccount());
        instagramAccount = instagramAccount[0];

        // 2. 바로 그 아이디의 행동을 현 시간으로 업데이트한다.
        await mysql.exec(MysqlQuery.getUpdateInstagramActionTime(instagramAccount.pk));

        // 3. duckduckgo에서 행동을 이행한다.
        // await adb.unlock();
        await device.duckduckgoInstagramSetup(adb);

        // 3-1. 인스타에 로그인한다.
        await adb.tapUntilImgFound(device.instagramImages.login);
        await adb.tapUntilImgFound(device.instagramImages.loginEmail);
        // await waitRandom();
        await adb.type(instagramAccount.id);
        // await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.loginPassword);
        // await waitRandom();
        await adb.type(instagramAccount.password);
        // await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.login);
        // await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.later);

        // 3-2. 해쉬태그를 검색하여 좋아요 창을 뛰운다.
        // await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.searchIcon);
        // await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.search);
        const categoryRelatedTags = await mysql.get(MysqlQuery.getCategoryRelatedTags(instagramAccount.categoryPk));
        const randomTag = Tools.getRandomFromArray(categoryRelatedTags)['tag'];
        // await waitRandom();
        await adb.type('#' + randomTag);
        // await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.hashtagIcon);
        await Tools.waitSec(5);
        await device.tapPopular(adb);
        // await waitRandom();
        await device.randomScrollDown(adb);
        // await waitRandom();
        await adb.tapUntilImgFound([device.instagramImages.allPeopleLiked, device.instagramImages.allPeopleLiked2]);
        await Tools.waitSec(5);

        // 3-3. 팔로우한다.
        let i = Number(instagramAccount.followPerAction);
        while (i) {
            // 팔로우 버튼이 존재하는지 확인한다.
            let followButtonFound = await adb.findImage(device.instagramImages.follow);

            // 팔로우 버튼이 존재한다면 클릭하고 i--한다.
            if (followButtonFound) {
                await adb.tapImage(device.instagramImages.follow);
                i--;
            }

            // 존재하지 않는다면 
            else {
                // 나중에 다시 시도하세요.
                let tryAgainLater = await adb.findImage(device.instagramImages.tryAgainOk);
                if (tryAgainLater) {
                    await adb.tapImage(device.instagramImages.tryAgainOk);
                    i = 0;
                }
                // 또는 스크롤
                else
                    await device.randomScrollDown(adb);
            }
        }

        // 3-4. blocked 여부를 확인한다.

        // 3-5. adb backup을 저장한다?
    }
    catch (e) {
        await adb.captureImage();
        console.log('error device = ' + device.name);
        console.log(e);
        return;
    }
}

const pocoM3 = {
    name: 'pocoM3',
    typeMinInterval: 50,
    typeMaxInterval: 100,
    duckduckgoInstagramSetup: async function (adb) {
        await adb.clearAppData('com.duckduckgo.mobile.android');
        await Tools.waitSec(4);
        await adb.openApp('com.duckduckgo.mobile.android');
        await adb.type('');
        await adb.tapUntilImgFound('../img/duckduckgo/pocoM3/letsDoIt.png')
        await adb.tapUntilImgFound('../img/duckduckgo/pocoM3/cancel.png')
        await adb.typeBasic('https://www.instagram.com');
        await adb.enter();
        await adb.tapUntilImgFound('../img/duckduckgo/pocoM3/gotIt.png')
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(150, 900),
            Tools.getRandomNumberInRange(1800, 2050),
            Tools.getRandomNumberInRange(150, 900),
            Tools.getRandomNumberInRange(400, 700), 500);
    },
    tapPopular: async function (adb) {
        await adb.tapLocation(Tools.getRandomNumberInRange(50, 1050), Tools.getRandomNumberInRange(850, 1850));
    },
    instagramImages: {
        login: '../img/instagram/pocoM3/login.png',
        loginEmail: '../img/instagram/pocoM3/loginEmail.png',
        loginPassword: '../img/instagram/pocoM3/loginPassword.png',
        later: '../img/instagram/pocoM3/later.png',
        searchIcon: '../img/instagram/pocoM3/searchIcon.png',
        search: '../img/instagram/pocoM3/search.png',
        hashtagIcon: '../img/instagram/pocoM3/hashtagIcon.png',
        allPeopleLiked: '../img/instagram/pocoM3/allPeopleLiked.png',
        allPeopleLiked2: '../img/instagram/pocoM3/allPeopleLiked2.png',
        follow: '../img/instagram/pocoM3/follow.png',
        tryAgainOk: '../img/instagram/pocoM3/tryAgainOk.png',
    }
}

async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(500, 1500));
}

async function main() {
    const s10Code = 'R39M60041TD'
    const s10Adb = ADB.new(s10Code);

    const pocoCode = '26b22a7d1120'
    const pocoAdb = ADB.new(pocoCode);

    await s10Adb.lteOff();
    await s10Adb.lteOn();

    await followInstagram(pocoAdb, pocoM3);
}

async function test() {
    const pocoCode = '26b22a7d1120'
    const pocoAdb = ADB.new(pocoCode);
    await pocoAdb.captureImage();
    // await pocoAdb.setBasicKeyboard('com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME');

    var exec = require('child_process').exec;

    // 백업 저장
    // exec('adb -s 26b22a7d1120 backup -f duckduckgo.ab com.duckduckgo.mobile.android',
    //     function (error, stdout, stderr) {
    //         console.log('stdout: ' + stdout);
    //         console.log('stderr: ' + stderr);
    //         if (error !== null) {
    //             console.log('exec error: ' + error);
    //         }
    //     });

    // await Tools.waitSec(1);
    // await pocoAdb.tapImage('../img/pocoM3/restoreData.png');

    // 백업 열기
    // exec('adb -s 26b22a7d1120 restore duckduckgo.ab',
    //     function (error, stdout, stderr) {
    //         console.log('stdout: ' + stdout);
    //         console.log('stderr: ' + stderr);
    //         if (error !== null) {
    //             console.log('exec error: ' + error);
    //         }
    //     });

    // await Tools.waitSec(1);
    // await pocoAdb.tapImage('../img/pocoM3/restoreData.png');
}



main();