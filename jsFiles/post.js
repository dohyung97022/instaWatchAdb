const Puppeteer = require('./puppeteer');
const Selector = require('./puppeteerSelectors');
const Mysql = require('./mysql');
const Tools = require('./tools');
const MysqlQuery = require('./mysqlQuery');
const Https = require('https');
const Fs = require('fs');


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
    const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: true });
    Tools.countLogger();
    await puppeteer.launch();
    Tools.countLogger();
    await puppeteer.emulate("iPhone 6");
    Tools.countLogger();
    await puppeteer.setCookieWithString(instagramId[0].cookies);
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
}

exports.lambdaHandler = async (event) => {
    const response = await main(event.id);
    return response;
};