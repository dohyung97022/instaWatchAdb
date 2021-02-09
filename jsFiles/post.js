const Puppeteer = require('./puppeteer');
const Selector = require('./puppeteerSelectors');
const Mysql = require('./mysql');
const Tools = require('./tools');
const Ip = require('./ip');
const MysqlQuery = require('./mysqlQuery');
const Https = require('https');
const Fs = require('fs');

// eatsleepcoder
// mebamz

async function main(id) {
    const mysql = await Mysql.new();
    const instagramId = await mysql.get(MysqlQuery.getInstagramIdQuery(id));
    try {
        await saveIp();
        const notPostedRelatedPost = await mysql.get(MysqlQuery.getNotPostedRelatedPostsQuery(id));
        if (notPostedRelatedPost.length == 0) {
            console.log("no post available");
            return "no post available";
        }
        const file = Fs.createWriteStream("post.jpg");
        Https.get(notPostedRelatedPost[0].postUrl, function (response) { response.pipe(file) });
        const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: true });
        await puppeteer.launch();
        if (instagramId[0].cookies != "")
            await puppeteer.setCookieWithString(instagramId[0].cookies);
        await puppeteer.goto("https://www.instagram.com/tags/t");
        await puppeteer.waitSec(3);
        // 모바일에서의 쿠키 저장은 작용되지 않습니다.
        const loggedIn = await loginIfNot();
        if (loggedIn)
            await saveCookie();
        await puppeteer.waitSec(5);
        await puppeteer.emulate("iPhone 6");
        await puppeteer.goto("https://instagram.com");
        await puppeteer.waitForSelector(Selector.post);
        await puppeteer.clickSelector(Selector.post);
        await puppeteer.waitSec(3);
        const fileInput = await puppeteer.getElementBySelector(Selector.fileInput);
        await fileInput.uploadFile("./post.jpg");
        await puppeteer.waitForSelector(Selector.expand);
        await puppeteer.clickSelector(Selector.expand);
        await puppeteer.waitForSelector(Selector.next);
        await puppeteer.clickSelector(Selector.next);
        await puppeteer.waitForSelector(Selector.textInput);
        await puppeteer.clickSelector(Selector.textInput);
        const textInput = await puppeteer.getElementBySelector(Selector.textInput);
        Tools.countLogger();
        // post text에 id에 따라서 특정 text가 변화되는 경우 next와 share는 selector가 같습니다.
        await textInput.type(notPostedRelatedPost[0]['postText']);
        await puppeteer.waitSec(3);
        await puppeteer.waitForSelector(Selector.next);
        await puppeteer.clickSelector(Selector.next);
        await puppeteer.waitSec(3);
        await puppeteer.close();

        await mysql.exec(MysqlQuery.getInsertIdPostedPostQuery(instagramId[0].pk, notPostedRelatedPost[0].pk));
        await mysql.exec(MysqlQuery.getIncreseTimesPostedQuery(notPostedRelatedPost[0].pk));
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
                puppeteer.waitSec(3);
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
    }
    catch (error) {
        await mysql.exec(MysqlQuery.getInsertLogQuery(Tools.getCurrentFileName(), instagramId[0].pk, error, Tools.getCurrentDateTime()));
        console.log(error);
        return error;
    }
}

exports.lambdaHandler = async (event) => {
    const response = await main(event.id);
    return response;
};