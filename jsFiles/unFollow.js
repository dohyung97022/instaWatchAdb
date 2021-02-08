const Puppeteer = require('./puppeteer');
const Ip = require('./ip');
const Mysql = require('./mysql');
const Tools = require('./tools');
const MysqlQuery = require('./mysqlQuery');


// eatsleepcoder
// mebamz
main("eatsleepcoder");

async function main(id) {
    const ip = await Ip.new();
    const ipAddress = await ip.getIp();
    console.log("my ip address is = " + ipAddress);
    const mysql = await Mysql.new();
    Tools.countLogger();
    const instagramId = await mysql.get(MysqlQuery.getInstagramIdQuery(id));
    Tools.countLogger();
    const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: false });
    Tools.countLogger();
    await puppeteer.launch();
    Tools.countLogger();
    if (instagramId[0].cookies != "")
        await puppeteer.setCookieWithString(instagramId[0].cookies);
    Tools.countLogger();
    await puppeteer.goto("https://www.instagram.com");
    Tools.countLogger();
    const loggedIn = await loginIfNot();
    Tools.countLogger();
    if (loggedIn)
        await saveCookie();
    await puppeteer.goto("https://www.instagram.com/" + id + "/");
    const followingButton = await puppeteer.getElementsByXpath("//li[contains(., 'following')]");
    await followingButton[0].click();
    await unFollowByLimit(instagramId[0].unfollowPerAction);
    Tools.countLogger();
    await puppeteer.close();
    Tools.countLogger();


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
            puppeteer.waitSec(3);
            return true;
        }
        return false;
    }
    async function saveCookie() {
        const cookiesObject = await puppeteer.getCookiesObject();
        mysql.exec(MysqlQuery.getUpdateCookiesQuery(id, JSON.stringify(cookiesObject, null, 2)));
    }
    async function checkActionBlocked() {
        const actionBlockedButton = await puppeteer.getElementsByXpath("//button[contains(., 'Report a')]");
        if (actionBlockedButton.length) {
            console.log("this account is action blocked!");
            process.exit(1);
        }
    }
    async function unFollowByLimit(maxUnfollowLimit) {
        unFollowAll:
        while (maxUnfollowLimit) {
            var followingButtons = await puppeteer.getElementsByXpath("//button[.='Following']");
            var allButtons = await puppeteer.getElementsByXpath("//button[.='Follow' or contains(., 'Following')]");
            if (followingButtons.length)
                for (let i = 0; i < followingButtons.length && maxUnfollowLimit; i++) {
                    try {
                        await followingButtons[i].focus();
                        await followingButtons[i].click();
                        await puppeteer.waitSec(2);
                        await checkActionBlocked();
                        var unFollowButton = await puppeteer.getElementsByXpath("//button[.='Unfollow']");
                        await unFollowButton[0].click();
                        maxUnfollowLimit--;
                        await puppeteer.waitSec(2);
                        await checkActionBlocked();
                        var text = await puppeteer.getTextFromElement(followingButtons[i]);
                        if (text == "Following") {
                            break unFollowAll;
                        }
                    } catch (e) {
                    }
                }
            if (allButtons.length)
                await allButtons[allButtons.length - 1].focus();
        }
    }
}

exports.lambdaHandler = async (event) => {
    const response = await main(event.id);
    return response;
};