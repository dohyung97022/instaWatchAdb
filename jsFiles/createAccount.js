const Puppeteer = require('./puppeteer');
const Ip = require('./ip');
const Mysql = require('./mysql');
const Tools = require('./tools');
const MysqlQuery = require('./mysqlQuery');


// eatsleepcoder
// mebamz



main("coding");

async function main(category) {
    const mysql = await Mysql.new();
    try {
        const puppeteer = Puppeteer.new({ args: ['--single-process', '--no-zygote', '--no-sandbox'], headless: false });
        await puppeteer.launch();
        await puppeteer.goto("https://www.instagram.com");

        // TODO : 
        // id를 만들고 ip를 저장한다.
        // id가 생기기 이전에 error가 생길 수 있다. 그 경우
        // logs의 table에 id 없이 저장이 되는가?

        await puppeteer.waitSec(5);
        const signUp = await puppeteer.getElementsByXpath("//a[contains(@href, 'signup')]");
        if (signUp.length)
            await signUp[0].click();

        const randomEmail = Tools.getRandomLettersOfLen(9) + "@adiy.io";
        await puppeteer.waitSec(5);

        const emailInput = await puppeteer.getElementsByXpath("//input[contains(@aria-label, 'Email')]");
        await emailInput[0].click();
        await puppeteer.waitSec(3);
        await emailInput[0].type(randomEmail);
        await puppeteer.waitSec(5);

        const fullNameInput = await puppeteer.getElementsByXpath("//input[contains(@aria-label, 'Name')]");
        await fullNameInput[0].click();
        await puppeteer.waitSec(3);
        await fullNameInput[0].type(Tools.getRandomHangulName());
        await puppeteer.waitSec(5);

        const firstUserName = Tools.getRandomLettersOfLen(Tools.getRandomFromArray([2, 3, 4, 5]));
        const connector = Tools.getRandomFromArray(["_", "."]);
        const lastUserNames = await mysql.get(MysqlQuery.getCategoryUserNamesQuery(category));
        const fullUserName = firstUserName + connector + Tools.getRandomFromArray(lastUserNames).userName;

        const userNameInput = await puppeteer.getElementsByXpath("//input[contains(@aria-label, 'User')]");
        await userNameInput[0].click();
        await puppeteer.waitSec(3);
        await userNameInput[0].type(fullUserName);
        await puppeteer.waitSec(5);

        const randomPassword = Tools.getRandomLettersOfLen(9);
        const passwordInput = await puppeteer.getElementsByXpath("//input[contains(@aria-label, 'Password')]");
        await passwordInput[0].click();
        await puppeteer.waitSec(3);
        await passwordInput[0].type(randomPassword);
        await puppeteer.waitSec(5);


        const signUpButton = await puppeteer.getElementsByXpath("//button[contains(., 'Sign up')]");
        await signUpButton[0].click();
        await puppeteer.waitSec(5);

        await selectFromDropdown("Month");
        await puppeteer.waitSec(3);
        await selectFromDropdown("Day");
        await puppeteer.waitSec(3);
        await selectFromDropdown("Year");
        await puppeteer.waitSec(4);

        const nextButton = await puppeteer.getElementsByXpath("//button[contains(., 'Next')]");
        await nextButton[0].click();

        console.log(fullUserName);

        // request가 급격하게 많아지면 ip ban을 당한다.
        // ip를 변동해도 다시 ban이 걸린다.
        // 쿠키의 문제인가?
        // domain이 ban 되어버린 것인가?

        // await saveIp();

        async function selectFromDropdown(dropDownTitle) {
            const dropDowns = await puppeteer.getElementsByXpath("//select[contains(@title, '" + dropDownTitle + "')]");
            await dropDowns[0].click();
            await puppeteer.waitSec(3);

            const options = await puppeteer.getElementsByXpath("//select[contains(@title, '" + dropDownTitle + "')]//option[@value]");
            var selectedMonthDropDown;
            if (dropDownTitle == "Year")
                selectedMonthDropDown = Tools.getRandomFromArray(options.slice(8, 30));
            else selectedMonthDropDown = Tools.getRandomFromArray(options);
            await selectedMonthDropDown[0].click();

            const property = await selectedMonthDropDown.getProperty('value');
            const value = await property.jsonValue();
            console.log("value is = " + value);
            await puppeteer.selectFromDropdown('select[title="' + dropDownTitle + ':"]', value);
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
        async function checkActionBlocked() {
            const actionBlockedButton = await puppeteer.getElementsByXpath("//button[contains(., 'Report a')]");
            if (actionBlockedButton.length) {
                console.log("this account is action blocked!");
                await mysql.exec(MysqlQuery.getUpdateActionBlockedQuery(id, true));
                process.exit(1);
            }
        }

    } catch (error) {
        console.log(error);
        await mysql.exec(MysqlQuery.getInsertLogQuery(Tools.getCurrentFileName(), "", error, Tools.getCurrentDateTime()));
        return error;
    }
}

exports.lambdaHandler = async (event) => {
    const response = await main(event.category);
    return response;
};