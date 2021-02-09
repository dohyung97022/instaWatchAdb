const Puppeteer = require('./puppeteer');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');
const Tools = require('./Tools');
const { codingCategory } = require('./data');

// eatsleepcoder
// mebamz

async function main(id) {
    const mysql = await Mysql.new();
    const instagramId = await mysql.get(MysqlQuery.getInstagramIdQuery(id));
    try {
        await saveIp();
        const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: true });
        await puppeteer.launch();
        await puppeteer.setCookieWithString(instagramId[0].cookies);
        await puppeteer.goto(Tools.getRandomFromArray(codingCategory));
        const loggedIn = await loginIfNot();
        if (loggedIn)
            await saveCookie();
        const hotPostArry = await getPostArrayOfLen(6);
        const othersWhoLikedButton = await getOthersWhoLikedButtonFromPostArray(hotPostArry);
        await puppeteer.waitSec(3);
        othersWhoLikedButton[0].click();
        await puppeteer.waitSec(5);
        await followLikePopupByLimit(instagramId[0].followPerAction);
        const userArry = await getUserArrayFromHTMLStr();
        await puppeteer.waitSec(3);
        await likePostsOfUserArrayByLimit(userArry, 3, instagramId[0].likePerAction);
        await puppeteer.close();
        return Tools.getCurrentFileName() + " finished"

        async function loginIfNot() {
            var loginButton = await puppeteer.getElementsByXpath("//button[.='로그인' or contains(., 'Log In') or contains(., 'login')]");
            if (loginButton.length) {
                await loginButton[0].click();
                await puppeteer.waitSec(3);
                const idInput = await puppeteer.getElementsByXpath("//input[@name='username']");
                await idInput[0].type(instagramId[0].id);
                const pwInput = await puppeteer.getElementsByXpath("//input[@name='password']");
                await pwInput[0].type(instagramId[0].password);
                var retry = 5;
                var disabledSubmitButton = await puppeteer.getElementsByXpath("//button[@disabled]");
                while (retry-- && disabledSubmitButton.length) {
                    puppeteer.waitSec(1);
                    disabledSubmitButton = await puppeteer.getElementsByXpath("//button[@disabled]");
                }
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
            mysql.exec(MysqlQuery.getUpdateCookiesQuery(id, JSON.stringify(cookiesObject, null, 2)));
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
                othersWhoLikedButton = await puppeteer.getAtLeastOneElementFromXpathArray(["//button[contains(., 'others')]", "//button[contains(., 'likes')]"]);
                if (!othersWhoLikedButton.length)
                    othersWhoLikedButton = await puppeteer.getAtLeastOneElementFromXpathArray(["//a[contains(., 'others')]", "//a[contains(., 'likes')]"]);
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
        async function likePostsOfUserArrayByLimit(users, likePerUser, maxLikeLimit) {
            likePosts:
            for (const user of users) {
                console.log("user = " + user);
                if (maxLikeLimit)
                    try {
                        await puppeteer.goto('https://www.instagram.com' + user);
                        await puppeteer.waitSec(3);
                        var userPostArry = await getPostArrayOfLen(likePerUser);
                        console.log("userPostArry = " + userPostArry);
                        if (userPostArry != null)
                            for (const userPost of userPostArry) {
                                await puppeteer.goto('https://www.instagram.com' + userPost);
                                await puppeteer.waitSec(3);
                                var [likeButton] = await puppeteer.getElementsByXpath('//*[name()="svg" and @aria-label="Like" and @height="24"]');
                                if (likeButton) {
                                    await puppeteer.waitSec(3);
                                    if (maxLikeLimit) {
                                        likeButton.click();
                                        maxLikeLimit--;
                                    } else
                                        break likePosts;
                                    await puppeteer.waitSec(3);
                                    await checkActionBlocked();
                                }
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