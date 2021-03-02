const ADB = require('./adbf');
const Robot = require('./robot');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');

async function followInstagram(adb) {
    try {
        // 1. mysql에서 가장 오래 행동되지 않은 아이디를 가져온다.
        const mysql = await Mysql.new();
        let instagramAccount = await mysql.get(MysqlQuery.getMostWaitedInstagramAccount());

        instagramAccount = instagramAccount[0];

        // 2. 바로 그 아이디의 행동을 현 시간으로 업데이트한다.
        await mysql.exec(MysqlQuery.getUpdateInstagramActionTime(instagramAccount.pk));


        // 3-1. incogniton을 연다.
        Robot.exec('C:\\Users\\doe\\AppData\\Local\\Programs\\incogniton\\incogniton.exe');
        // 3-2. incogniton에서 로그인한다.
        await Robot.findImage('../img/windows/incogniton/usernameEmail.png');
        // 3-3. incogniton에서 10개의 profile을 forloop을 돌면서 follow한다.

        // 3-2. 해쉬태그를 검색하여 좋아요 창을 뛰운다.
        // await waitRandom();
        // await adb.tapUntilImgFound(device.instagramImages.searchIcon);
        // await waitRandom();
        // await adb.tapUntilImgFound(device.instagramImages.search);
        // const categoryRelatedTags = await mysql.get(MysqlQuery.getCategoryRelatedTags(instagramAccount.categoryPk));
        // const randomTag = Tools.getRandomFromArray(categoryRelatedTags)['tag'];
        // await waitRandom();
        // await adb.type('#' + randomTag);
        // await waitRandom();
        // await adb.tapUntilImgFound(device.instagramImages.hashtagIcon);
        // await Tools.waitSec(5);
        // await device.tapPopular(adb);
        // // 조회의 경우는?
        // await adb.tapUntilImgFound([device.instagramImages.allPeopleLiked, device.instagramImages.allPeopleLiked2]);
        // await Tools.waitSec(5);

        // // 3-3. 팔로우한다.
        // let i = Number(instagramAccount.followPerAction);
        // while (i) {
        //     await Tools.waitSec(1);
        //     // 다음에 시도하세요 버튼이 존재하는지 확인한다.
        //     let tryAgainLater = await adb.findImage(device.instagramImages.tryAgainOk);
        //     // 버튼이 존재한다면 클릭하고 i=0한다.
        //     if (tryAgainLater) {
        //         await adb.tapImage(device.instagramImages.tryAgainOk);
        //         i = 0;
        //     }
        //     // 존재하지 않는다면 
        //     else {
        //         // 팔로우 버튼을 누른다.
        //         let followButtonFound = await adb.findImage(device.instagramImages.follow);

        //         if (followButtonFound) {
        //             await adb.tapImage(device.instagramImages.follow);
        //             i--;
        //         }
        //         // 또는 스크롤
        //         else
        //             await device.randomScrollDown(adb);
        //     }
    }
    // 3-4. blocked 여부를 확인한다.

    // 3-5. adb backup을 저장한다?

    catch (e) {
        return;
    }
}



async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(3000, 4500));
}

async function main() {
    const s10Code = 'R39M60041TD'
    const s10Adb = ADB.new(s10Code);

    for (let i = 0; i < 50; i++) {
        await s10Adb.lteOff();
        await Tools.waitSec(5);
        await s10Adb.lteOn();
        await Tools.waitSec(5);

        await followInstagram(s10Adb);

        await s10Adb.lteOff();
        await s10Adb.lteOn();
    }
}

async function test() {
    const s10Code = 'R39M60041TD'
    const adb = ADB.new(s10Code);
    await adb.lteOn();

    var mysql = await Mysql.new();
    let incognitonIds = await mysql.get(MysqlQuery.getAllUnassignedIncognitonId());

    // incogniton을 연다.
    Robot.exec('C:\\Users\\doe\\AppData\\Local\\Programs\\incogniton\\incogniton.exe');
    for (var incognitonId of incognitonIds) {

        // incogniton에서 로그인한다.
        await Robot.clickUntilImgFound('../img/windows/incogniton/usernameEmail.png');
        await Robot.typeBasic(incognitonId.id);
        await Robot.clickUntilImgFound('../img/windows/incogniton/password.png');
        await Robot.typeBasic(incognitonId.password);
        await Robot.clickUntilImgFound('../img/windows/incogniton/rememberMe.png');
        await Robot.clickUntilImgFound('../img/windows/incogniton/login.png');

        // 할당이 되지 않은 인스타 아이디를 가져온다.
        while (incognitonId.assignedAmount < 10) {
            mysql = await Mysql.new();
            let nullIncogInstaId = await mysql.get(MysqlQuery.getNullIncognitonPkInstagramId());
            nullIncogInstaId = nullIncogInstaId[0];

            var isInProfileCreation = false;
            while (!isInProfileCreation) {
                await Robot.clickImage('../img/windows/incogniton/createSingle.png');
                await Tools.waitSec(2);
                isInProfileCreation = await Robot.findImage('../img/windows/incogniton/newProfile.png');
            }

            await adb.lteOff();
            await Tools.waitSec(5);
            await adb.lteOn();
            await Tools.waitSec(10);

            await Robot.clickUntilImgFound('../img/windows/incogniton/getNewFingerprint.png');
            await Robot.clickUntilImgFound('../img/windows/incogniton/newProfile.png');
            for (let i = 0; i < 11; i++)
                await Robot.delete();
            await Robot.typeBasic(nullIncogInstaId.id);
            await Robot.clickUntilImgFound('../img/windows/incogniton/createProfile.png');

            // 계정 로그인...?
            await Robot.clickUntilImgFound('../img/windows/incogniton/searchProfiles.png');
            for (let i = 0; i < 30; i++)
                await Robot.delete();
            await Robot.typeBasic(nullIncogInstaId.id);
            await Tools.waitSec(3);
            var isInChrome = false;
            while (!isInChrome) {
                await Robot.clickImage('../img/windows/incogniton/start.png');
                await Tools.waitSec(10);
                isInChrome = await Robot.findImage('../img/windows/chrome/google/search.png');
            }
            await Robot.clickUntilImgFound('../img/windows/chrome/google/search.png');
            await Tools.waitSec(1);
            await Robot.typeBasic('www.instagram.com');
            await Robot.enter();
            await Robot.clickUntilImgFound('../img/windows/chrome/instagram/username.png');
            await waitRandom();
            await Robot.type(nullIncogInstaId.id);
            await waitRandom();
            await Robot.clickUntilImgFound('../img/windows/chrome/instagram/password.png');
            await Robot.type(nullIncogInstaId.password);
            await waitRandom();
            await Robot.clickUntilImgFound('../img/windows/chrome/instagram/login.png');
            await Tools.waitSec(5);
            // capcha check
            var isARobot = false;
            isARobot = await Robot.findImage('../img/windows/chrome/instagram/imNotARobot.png');
            if (isARobot) {
                mysql = await Mysql.new();
                await mysql.exec(`
                DELETE FROM instaWatch.instagramId
                WHERE pk = `+ nullIncogInstaId.pk + `;
                `);
                await Robot.clickUntilImgFound('../img/windows/chrome/window.png');
                await Robot.clickUntilImgFound('../img/windows/chrome/close.png');
                await Tools.waitSec(6);
                await Robot.clickUntilImgFound('../img/windows/incogniton/profileOptions.png');
                await Robot.clickUntilImgFound('../img/windows/incogniton/delete.png');
                await Robot.clickUntilImgFound('../img/windows/incogniton/continue.png');
                continue;
            }
            await waitRandom();
            await Robot.clickUntilImgFound('../img/windows/chrome/instagram/saveInfo.png');
            await waitRandom();
            await Robot.clickUntilImgFound('../img/windows/chrome/instagram/later.png');
            await waitRandom();
            await Robot.clickUntilImgFound('../img/windows/chrome/instagram/search.png');
            await Robot.clickUntilImgFound('../img/windows/chrome/window.png');
            await Robot.clickUntilImgFound('../img/windows/chrome/close.png');

            mysql = await Mysql.new();
            await mysql.exec(MysqlQuery.getSetInstagramIdIncognitonPk(nullIncogInstaId.pk, incognitonId.pk));
            await mysql.exec(`
            UPDATE instaWatch.incognitonId
            SET assignedAmount = assignedAmount + 1
            WHERE pk = `+ incognitonId.pk + `;
            `);
            incognitonId.assignedAmount++;
        }

        await Robot.clickUntilImgFound('../img/windows/incogniton/logout.png');
    }
}

test();