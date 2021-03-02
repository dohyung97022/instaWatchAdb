const ADB = require('./adbf');
const Robot = require('./robot');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');

// ------------------------------- partial functions ---------------------------------
async function openIncogniton() {
    Robot.exec('C:\\Users\\doe\\AppData\\Local\\Programs\\incogniton\\incogniton.exe');
}
async function loginIncogniton(id, pw) {
    // incogniton에서 로그인한다.
    await Robot.clickUntilImgFound('../img/windows/incogniton/usernameEmail.png');
    await Robot.typeBasic(id);
    await Robot.clickUntilImgFound('../img/windows/incogniton/password.png');
    await Robot.typeBasic(pw);
    await Robot.clickUntilImgFound('../img/windows/incogniton/rememberMe.png');
    await Robot.clickUntilImgFound('../img/windows/incogniton/login.png');
    var isLoggedIn = false;
    while (!isLoggedIn) {
        await Tools.waitSec(2);
        isLoggedIn = await Robot.findImage('../img/windows/incogniton/createSingle.png');
    }
}
async function logoutIncogniton() {
    await Robot.clickUntilImgFound('../img/windows/incogniton/logout.png');
}
async function openCromeFromIncogniton(id) {
    // 계정 로그인...?
    await Robot.clickUntilImgFound('../img/windows/incogniton/searchProfiles.png');
    for (let i = 0; i < 30; i++)
        await Robot.delete();
    await Robot.typeBasic(id);
    await Tools.waitSec(3);
    var isInChrome = false;
    while (!isInChrome) {
        // 매우 위험한 코드다...
        await Robot.clickImage('../img/windows/incogniton/firstStart.png', 0, 33);
        await Tools.waitSec(5);
        await Robot.clickImage('../img/windows/incogniton/useLocalSave.png');
        await Tools.waitSec(5);
        isInChrome = await Robot.findImage('../img/windows/chrome/window.png');
    }
}
async function closeCrome() {
    await Robot.clickUntilImgFound('../img/windows/chrome/window.png');
    await Robot.clickUntilImgFound('../img/windows/chrome/close.png');
}
async function lteReset(adb, betweenWait, afterWait) {
    if (!betweenWait)
        betweenWait = 5;
    if (!afterWait)
        afterWait = 10;
    await adb.lteOff();
    await Tools.waitSec(betweenWait);
    await adb.lteOn();
    await Tools.waitSec(afterWait);
}
async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(3000, 4500));
}

// ------------------------------- insta functions ---------------------------------
async function home() {

}

async function randomScroll() {
    // let random = Tools.getRandomNumberInRange(10, 40)
    // await Robot.hoverImage('../img/windows/chrome/instagram/search.png');
    while (true) {
        await Robot.scroll(-30, 100);
        console.log('scrolling')
    }
}

// ------------------------------- main functions ---------------------------------
async function setup() {
    const s10Code = 'R39M60041TD'
    const adb = ADB.new(s10Code);
    await lteReset(adb);
    await Tools.waitSec(10);

    var mysql = await Mysql.new();
    let incognitonIds = await mysql.get(MysqlQuery.getAllUnassignedIncognitonId());

    // incogniton을 연다.
    await openIncogniton();
    for (var incognitonId of incognitonIds) {

        // incogniton에서 로그인한다.
        await loginIncogniton(incognitonId.id, incognitonId.password);

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

            await lteReset(adb);

            await Robot.clickUntilImgFound('../img/windows/incogniton/getNewFingerprint.png');
            await Robot.clickUntilImgFound('../img/windows/incogniton/newProfile.png');
            for (let i = 0; i < 11; i++)
                await Robot.delete();
            await Robot.typeBasic(nullIncogInstaId.id);
            await Robot.clickUntilImgFound('../img/windows/incogniton/createProfile.png');

            // 계정 로그인...?
            await openCromeFromIncogniton(nullIncogInstaId.id);

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
            await closeCrome();

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

async function follow() {
    const s10Code = 'R39M60041TD'
    const adb = ADB.new(s10Code);
    await lteReset(adb);
    var mysql = await Mysql.new();

    // incogniton에서 가장 오래동안 일을 하지 않은 아이디를 찾는다.
    let unUsedIncognitonIds = await mysql.get(
        `SELECT * FROM instaWatch.incognitonId
        ORDER BY lastActionTime ASC
        `
    );
    await openIncogniton();
    for (const unUsedIncognitonId of unUsedIncognitonIds) {
        await loginIncogniton(unUsedIncognitonId.id, unUsedIncognitonId.password);

        // Incogniton과 연결된 아이디들 중 waitTime을 지난 아이디를 찾는다.
        const betweenActionMinute = 60;
        mysql = await Mysql.new();
        let connectedInstaIds = await mysql.get(
            `SELECT * FROM instaWatch.instagramId
            WHERE incognitonPk = `+ unUsedIncognitonId.pk + `
            AND (NOW() - INTERVAL `+ betweenActionMinute + ` MINUTE) > lastActionTime
            ORDER BY lastActionTime ASC`
        );

        // 연결한다.
        for (const connectedInstaId of connectedInstaIds) {
            await lteReset(adb);
            await openCromeFromIncogniton(connectedInstaId.id);
            await Tools.waitSec(10);
            var isARobot = false;
            isARobot = await Robot.findImage('../img/windows/chrome/instagram/imNotARobot.png');
            if (isARobot)
                console.log('I am a robot')
            else {
                mysql = await Mysql.new();
                await mysql.exec(
                    `UPDATE instaWatch.instagramId
                    SET lastActionTime = NOW()
                    WHERE pk = `+ connectedInstaId.pk + `
                    `
                );
            }
            await closeCrome();
        }
        await logoutIncogniton();
    }
}

async function test() {
}

randomScroll();