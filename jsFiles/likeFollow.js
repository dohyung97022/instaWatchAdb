const Puppeteer = require('./puppeteer');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');
const Tools = require('./Tools');
const { codingCategory } = require('./data');

// eatsleepcoder
// mebamz
main("eatsleepcoder");

async function main(id) {
    Tools.countLogger();
    const mysql = await Mysql.new();
    Tools.countLogger();
    const instagramId = await mysql.get(MysqlQuery.getInstagramIdQuery(id));
    Tools.countLogger();
    const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: false });
    Tools.countLogger();
    await puppeteer.launch();
    Tools.countLogger();
    await puppeteer.setCookieWithString(instagramId[0].cookies);
    Tools.countLogger();

    await puppeteer.goto(Tools.getRandomFromArray(codingCategory));

    Tools.countLogger();
    const loggedIn = await loginIfNot();
    if (loggedIn)
        await saveCookie();
    Tools.countLogger();

    const hotPostArry = await getPostArrayOfLen(6);
    Tools.countLogger();
    const othersWhoLikedButton = await getOthersWhoLikedButtonFromPostArray(hotPostArry);
    Tools.countLogger();
    await puppeteer.waitSec(3);
    Tools.countLogger();
    othersWhoLikedButton[0].click();
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
    return "finished";


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

    // TODO: actionBlock이 될 경우 mysql에 bocked = true로 변동하기
    async function checkActionBlocked() {
        const actionBlockedButton = await puppeteer.getElementsByXpath("//button[contains(., 'Report a')]");
        if (actionBlockedButton.length) {
            console.log("this account is action blocked!");
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

    async function saveCookie() {
        const cookiesObject = await puppeteer.getCookiesObject();
        mysql.exec(MysqlQuery.getUpdateCookiesQuery(id, JSON.stringify(cookiesObject, null, 2)));
    }
}

exports.lambdaHandler = async (event) => {
    const response = await main(event.id);
    return response;
};