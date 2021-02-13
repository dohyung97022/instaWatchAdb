const Puppeteer = require('./puppeteer');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');
const Tools = require('./tools');
const Ip = require('./ip');

async function main(id) {
    const mysql = await Mysql.new();
    const instagramId = await mysql.get(MysqlQuery.getInstagramIdQuery(id));
    try {
        Tools.countLogger();
        await saveIp();
        Tools.countLogger();
        const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: true });
        Tools.countLogger();
        await puppeteer.launch();
        Tools.countLogger();
        if (instagramId[0].cookies != '')
            await puppeteer.setCookieWithString(instagramId[0].cookies);
        Tools.countLogger();
        const categoryRelatedTags = await mysql.get(MysqlQuery.getCategoryRelatedTags(instagramId[0].categoryPk));
        Tools.countLogger();
        await puppeteer.goto('https://www.instagram.com/explore/tags/' + Tools.getRandomFromArray(categoryRelatedTags)['tag']);
        Tools.countLogger();
        const loggedIn = await loginIfNot();
        Tools.countLogger();
        if (loggedIn)
            await saveCookie();
        Tools.countLogger();
        const hotPostArry = await getPostArrayOfLen(6);
        Tools.countLogger();
        const othersWhoLikedButton = await getOthersWhoLikedButtonFromPostArray(hotPostArry);
        Tools.countLogger();
        await puppeteer.waitSec(3);
        Tools.countLogger();
        await othersWhoLikedButton[0].click();
        Tools.countLogger();
        await puppeteer.waitSec(5);
        Tools.countLogger();
        await followLikePopupByLimit(instagramId[0].followPerAction);
        Tools.countLogger();
        const userArry = await getUserArrayFromHTMLStr();
        Tools.countLogger();
        await puppeteer.waitSec(3);
        Tools.countLogger();
        await likePostsOfUserArrayByLimit(userArry, 3, instagramId[0].likePerAction);
        Tools.countLogger();
        await puppeteer.close();
        Tools.countLogger();
        return Tools.getCurrentFileName() + " finished"

        async function loginIfNot() {
            var loginButton = await puppeteer.getElementsByXpath("//button[.='로그인' or contains(., 'Log In') or contains(., 'login')]");
            if (loginButton.length) {
                await loginButton[0].click();
                await puppeteer.waitSec(3);
                const idInput = await puppeteer.getElementsByXpath("//input[@name='username']");
                await idInput[0].type(instagramId[0].id, { delay: 200 });
                const pwInput = await puppeteer.getElementsByXpath("//input[@name='password']");
                await pwInput[0].type(instagramId[0].password, { delay: 200 });
                var retry = 5;
                var disabledSubmitButton = await puppeteer.getElementsByXpath("//button[@disabled]");
                while (retry-- && disabledSubmitButton.length) {
                    puppeteer.waitSec(1);
                    disabledSubmitButton = await puppeteer.getElementsByXpath("//button[@disabled]");
                }
                await puppeteer.waitSec(3);
                const submitButton = await puppeteer.getElementsByXpath("//button[@type='submit']");
                await submitButton[0].click();
                await puppeteer.waitSec(5);
                return true;
            }
            return false;
        }
        async function saveIp() {
            // ip를 받는다.
            const ipAddress = await Ip.getIp();
            // ip를 저장한다.
            try {
                await mysql.exec(MysqlQuery.getInsertIpQuery(ipAddress));
            } catch (e) {
                //this ip is has been visited before.
            }

            // ip의 pk를 받는다.
            const mysqlIp = await mysql.get(MysqlQuery.getIpQuery(ipAddress));

            // ip와 id를 idVisitedIps로 연결한다.
            try {
                await mysql.exec(MysqlQuery.getInsertIpVisitedIdsQuery(instagramId[0].pk, mysqlIp[0].pk));
            } catch (e) {
                //this ip has been visited by this id before.
            }
        }
        async function saveCookie() {
            const cookiesObject = await puppeteer.getCookiesObject();
            console.log(JSON.stringify(cookiesObject, null, 2));
            mysql.exec(MysqlQuery.getUpdateCookiesQuery(id, JSON.stringify(cookiesObject, null, 2)));
        }
        async function getOthersWhoLikedButtonFromPostArray(postArray) {
            var othersWhoLikedButton = [];
            while (postArray.length && !othersWhoLikedButton.length) {
                await puppeteer.goto('https://www.instagram.com' + Tools.getRandomRemovedFromArray(postArray));
                const writerFollowButton = await puppeteer.getElementsByXpath("//button[.='Follow']");
                if (writerFollowButton.length) {
                    await writerFollowButton[0].click();
                    await puppeteer.waitSec(3);
                    await checkActionBlocked();
                }
                othersWhoLikedButton = await puppeteer.getElementsByXpath(["//a[contains(., 'others') or contains(., 'likes')]"]);
                if (!othersWhoLikedButton.length)
                    othersWhoLikedButton = await puppeteer.getElementsByXpath(["//button[contains(., 'others') or contains(., 'likes')]"]);
            }
            if (postArray.length == 0 && !othersWhoLikedButton.length) {
                console.log("Is not able to find get all likes buttons in all posts!!!");
                process.exit(1);
            }
            return othersWhoLikedButton;
        }
        async function getUserArrayFromHTMLStr() {
            const pageHTML = await puppeteer.getHTMLStr();
            var users = [...new Set(pageHTML.match(/href="\/[^\/"]+\//g))];
            for (let i = 0; i < users.length; i++)
                users[i] = users[i].split('href="')[1];
            for (let i = users.length - 1; i >= 0; i--) {
                const notUsers = ['/data/', '/static/', '/p/', '/direct/', '/explore/', '/accounts/', '/about/', '/developer/', '/legal/', '/directory/'];
                for (const notUser of notUsers) {
                    if (users[i] == notUser) {
                        users = users.filter(item => item != notUser);
                    }
                }
            }
            return users;
        }
        async function checkActionBlocked() {
            const actionBlockedButton = await puppeteer.getElementsByXpath("//button[contains(., 'Report a')]");
            if (actionBlockedButton.length) {
                console.log("this account is action blocked!");
                await mysql.exec(MysqlQuery.getUpdateActionBlockedQuery(id, true));
                process.exit(1);
            }
        }
        async function followLikePopupByLimit(maxFollowLimit) {
            followAll:
            while (maxFollowLimit) {
                var followButtons = await puppeteer.getElementsByXpath("//button[.='Follow']");
                var allButtons = await puppeteer.getElementsByXpath("//button[.='Follow' or contains(., 'Following') or contains(., 'Requested')]");
                if (followButtons.length)
                    for (let i = 0; i < followButtons.length && maxFollowLimit; i++) {
                        await followButtons[i].focus();
                        await followButtons[i].click();
                        maxFollowLimit--;
                        await puppeteer.waitSec(3);
                        await checkActionBlocked();
                        var text = await puppeteer.getTextFromElement(followButtons[i]);
                        if (text == "Follow") {
                            break followAll;
                        }
                    }
                if (allButtons.length)
                    await allButtons[allButtons.length - 1].focus();
            }
        }
        async function getPostArrayOfLen(len) {
            const htmlStr = await puppeteer.getHTMLStr();
            const htmlMatch = htmlStr.match(/a\shref="\/p\/[^\/]+\//g);
            var postArray;
            if (htmlMatch)
                postArray = htmlMatch.splice(0, len);
            if (postArray != null)
                for (let i = 0; i < postArray.length; i++)
                    postArray[i] = postArray[i].split('"').pop();
            return postArray;
        }
        async function likePostsOfUserArrayByLimit(users, likePerUser, maxLikeLimit) {
            likePosts:
            for (const user of users) {
                if (maxLikeLimit)
                    try {
                        await puppeteer.goto('https://www.instagram.com' + user);
                        await puppeteer.waitSec(3);
                        var userPostArry = await puppeteer.getElementsByXpath("//a[contains(@href,'/p/')]//div//div//img");
                        if (userPostArry.length > likePerUser)
                            userPostArry = userPostArry.slice(0, likePerUser);
                        if (userPostArry != null)
                            for (const userPost of userPostArry) {
                                await userPost.click();
                                await puppeteer.waitSec(3);
                                var [likeButton] = await puppeteer.getElementsByXpath('//*[name()="svg" and @aria-label="Like" and @height="24"]');
                                if (likeButton) {
                                    if (maxLikeLimit) {
                                        likeButton.click();
                                        maxLikeLimit--;
                                    } else
                                        break likePosts;
                                    await puppeteer.waitSec(2);
                                    await checkActionBlocked();
                                }
                                await puppeteer.page.mouse.click(100, 100);
                                await puppeteer.waitSec(2);
                            }
                    } catch (e) {
                        console.log(e);
                    }
            }
        }

    } catch (error) {
        await mysql.exec(MysqlQuery.getInsertLogQuery(Tools.getCurrentFileName(), instagramId[0].pk, error, Tools.getCurrentDateTime()));
        console.log(error);
        return error;
    }
}

exports.lambdaHandler = async (event) => {
    const response = await main(event.id);
    return response;
};



// 문제
// 자동화를 통해 계정을 돌리면 바로 차단당했다.

// 요소
// chromium, click 요소, id의 질

// 실험 1.
// puppeteer를 사용해서 많은 팔로우와 좋아요를 해본다.
// 평가 중점 : puppeteer와 chrome의 차이 평가
// 팔로우 : 30
// 좋아요 : 20
// 아이디 pk : 6
// 성공
// 된다....
// 포스트는 클릭적인 요소가 중요한 것 같다.


// 실험 2.
// post를 url로 들어가지 않고 클릭해서 들어가고 클릭하서 나온다.
// 평가 중점 : post url로 바로 들어가는 것이 문제인지 파악
// 팔로우 : 25
// 좋아요 : 20
// 아이디 pk : 7
// 성공
// 클릭이 문제였다.
// selenium은 아직 detected되지 않았다.

// 실험 3.
// 실험 2의 재실험
// 평가 중점 : 실험 2의 중점이 맞는지 재확인 하기
// 팔로우 : 25
// 좋아요 : 20
// 아이디 pk : 8
// 성공
// 클릭이 문제였다는 점은 확정, 수정 완료

// pk 9 docker 실험