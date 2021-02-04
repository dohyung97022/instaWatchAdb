const puppeteerClass = require('./puppeteer');
const mysqlClass = require('./mysql');
const tools = require('./tools');
const https = require('https');
const fs = require('fs');
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html
// https://www.youtube.com/watch?v=Wnbw15Oue1k&t=203s
// https://docs.aws.amazon.com/code-samples/latest/catalog/javascriptv3-s3-src-s3_createbucket.ts.html
main("01085656981");
async function main(id) {
    async function checkActionBlocked() {
        const actionBlockedButton = await puppeteer.getElementsByXpath("//button[contains(., 'Report a')]");
        if (actionBlockedButton.length) {
            console.log("this account is action blocked!!!");
            process.exit(1);
        }
    }

    async function setCookiesFromString(string) {
        const cookieJson = await tools.getJsonFromString(string);
        await puppeteer.setCookieWithJson(cookieJson);
    }

    var countLoggerCounter = 0;
    function countLogger() {
        console.log(countLoggerCounter);
        countLoggerCounter++;
    }

    // 가정 1.
    // instagramId에 할당된 categoryId의 post를 받는다.
    // instagramId에 할당된 key의 idPostedPosts에 포함되지 않는 post를 찾는다.
    // asc times posted의 순서로 나열한다.


    // 아래 방법으로 해당 url을 받는다.
    const file = fs.createWriteStream("file.jpg");
    const request = https.get("https://instawatch-posts.s3.ap-northeast-2.amazonaws.com/programming-or-googling.jpg", function (response) {
        response.pipe(file);
    });

    // instagram 
    // https://github.com/Anyesh/instagram-bot-puppeteer


    // countLogger();
    // const mysql = await mysqlClass.new();
    // countLogger();
    // const instagramId = await mysql.get('SELECT * FROM instagramId WHERE id =\'' + id + '\'');
    // countLogger();
    // const puppeteer = puppeteerClass.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: false });
    // countLogger();
    // await puppeteer.launch();
    // countLogger();
    // await setCookiesFromString(instagramId[0].cookies);
    // countLogger();

    // await puppeteer.goto(tools.getRandomFromArray(codingCategory));
    // countLogger();

    // await puppeteer.close();
    // countLogger();
}

exports.lambdaHandler = async (event) => {
    // await main(event.id);
    console.log("waiting");
    await new Promise(r => setTimeout(r, 350000));
    console.log("waiting finished");
    return "the request has waited more than 350000 ms";
};

// login authentication
// aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 500023560643.dkr.ecr.ap-northeast-2.amazonaws.com

// testing build
// docker build -t like-follow-image:latest .
// docker run -p 9000:8080 like-follow-image:latest
// curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d {\"id\":\"01085656981\"}

// pushing image to ecs
// docker tag like-follow-image:latest 500023560643.dkr.ecr.ap-northeast-2.amazonaws.com/like-follow-image:latest
// docker push 500023560643.dkr.ecr.ap-northeast-2.amazonaws.com/like-follow-image:latest

// 

// max 150 actions per day
// 70 follows per day?

// Use conservative parameters 
// (max follows/unfollows per day 150 and max 20 per hour, 
// maybe even start out lower, and work your way up)