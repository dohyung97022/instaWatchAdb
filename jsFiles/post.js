const Puppeteer = require('./puppeteer');
const Selector = require('./puppeteerSelectors');
const Mysql = require('./mysql');
const Tools = require('./tools');
const MysqlQuery = require('./mysqlQuery');
const Https = require('https');
const Fs = require('fs');

// eatsleepcoder
// mebamz

main("eatsleepcoder");


async function main(id) {
    const mysql = await Mysql.new();
    Tools.countLogger();
    const instagramId = await mysql.get(MysqlQuery.getInstagramIdQuery(id));
    Tools.countLogger();
    const notPostedRelatedPost = await mysql.get(MysqlQuery.getNotPostedRelatedPostsQuery(id));
    Tools.countLogger();
    if (notPostedRelatedPost.length == 0) {
        console.log("no post available");
        return "no post available";
    }
    const file = Fs.createWriteStream("post.jpg");
    Https.get(notPostedRelatedPost[0].postUrl, function (response) { response.pipe(file) });
    Tools.countLogger();
    const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: false });
    Tools.countLogger();
    await puppeteer.launch();
    Tools.countLogger();
    if (instagramId[0].cookies != "")
        await puppeteer.setCookieWithString(instagramId[0].cookies);
    Tools.countLogger();
    await puppeteer.goto("https://www.instagram.com/tags/t");
    Tools.countLogger();
    await puppeteer.waitSec(3);
    Tools.countLogger();
    // 모바일에서의 쿠키 저장은 작용되지 않습니다.
    const loggedIn = await loginIfNot();
    Tools.countLogger();
    if (loggedIn)
        await saveCookie();
    Tools.countLogger();
    await puppeteer.waitSec(5);
    Tools.countLogger();
    await puppeteer.emulate("iPhone 6");
    Tools.countLogger();
    await puppeteer.goto("https://instagram.com");
    Tools.countLogger();
    await puppeteer.waitForSelector(Selector.post);
    Tools.countLogger();
    await puppeteer.clickSelector(Selector.post);
    Tools.countLogger();
    await puppeteer.waitSec(3);
    Tools.countLogger();
    const fileInput = await puppeteer.getElementBySelector(Selector.fileInput);
    Tools.countLogger();
    await fileInput.uploadFile("./post.jpg");
    Tools.countLogger();
    await puppeteer.waitForSelector(Selector.expand);
    Tools.countLogger();
    await puppeteer.clickSelector(Selector.expand);
    Tools.countLogger();
    await puppeteer.waitForSelector(Selector.next);
    Tools.countLogger();
    await puppeteer.clickSelector(Selector.next);
    Tools.countLogger();
    await puppeteer.waitForSelector(Selector.textInput);
    Tools.countLogger();
    await puppeteer.clickSelector(Selector.textInput);
    Tools.countLogger();
    const textInput = await puppeteer.getElementBySelector(Selector.textInput);
    Tools.countLogger();
    // post text에 id에 따라서 특정 text가 변화되는 경우는?
    await textInput.type(notPostedRelatedPost[0]['postText']);
    // next와 share는 selector가 같습니다.
    await puppeteer.waitSec(3);
    Tools.countLogger();
    await puppeteer.waitForSelector(Selector.next);
    Tools.countLogger();
    await puppeteer.clickSelector(Selector.next);
    Tools.countLogger();
    await puppeteer.waitSec(3);
    await puppeteer.close();
    Tools.countLogger();

    await mysql.exec(MysqlQuery.getInsertIdPostedPostQuery(instagramId[0].pk, notPostedRelatedPost[0].pk));
    Tools.countLogger();
    await mysql.exec(MysqlQuery.getIncreseTimesPostedQuery(notPostedRelatedPost[0].pk));
    Tools.countLogger();
    return "post finished";

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
}

exports.lambdaHandler = async (event) => {
    const response = await main(event.id);
    return response;
};