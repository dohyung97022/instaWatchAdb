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
        await Robot.new();
        // 3-2. incogniton에서 로그인한다.
        // 3-3. incogniton에서 10개의 profile을 forloop을 돌면서 follow한다.

        // 3-2. 해쉬태그를 검색하여 좋아요 창을 뛰운다.
        await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.searchIcon);
        await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.search);
        const categoryRelatedTags = await mysql.get(MysqlQuery.getCategoryRelatedTags(instagramAccount.categoryPk));
        const randomTag = Tools.getRandomFromArray(categoryRelatedTags)['tag'];
        await waitRandom();
        await adb.type('#' + randomTag);
        await waitRandom();
        await adb.tapUntilImgFound(device.instagramImages.hashtagIcon);
        await Tools.waitSec(5);
        await device.tapPopular(adb);
        // 조회의 경우는?
        await adb.tapUntilImgFound([device.instagramImages.allPeopleLiked, device.instagramImages.allPeopleLiked2]);
        await Tools.waitSec(5);

        // 3-3. 팔로우한다.
        let i = Number(instagramAccount.followPerAction);
        while (i) {
            await Tools.waitSec(1);
            // 다음에 시도하세요 버튼이 존재하는지 확인한다.
            let tryAgainLater = await adb.findImage(device.instagramImages.tryAgainOk);
            // 버튼이 존재한다면 클릭하고 i=0한다.
            if (tryAgainLater) {
                await adb.tapImage(device.instagramImages.tryAgainOk);
                i = 0;
            }
            // 존재하지 않는다면 
            else {
                // 팔로우 버튼을 누른다.
                let followButtonFound = await adb.findImage(device.instagramImages.follow);

                if (followButtonFound) {
                    await adb.tapImage(device.instagramImages.follow);
                    i--;
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



async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(5000, 6500));
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
}

test();