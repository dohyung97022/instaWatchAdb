const chromium = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
chromium.use(StealthPlugin());


module.exports.new = function (settings) {
    const puppeteer = {};
    puppeteer.chromium = chromium;
    puppeteer.headless = settings.headless;
    puppeteer.args = settings.args;
    puppeteer.browser = null;
    puppeteer.page = null;

    //puppeteer.launch
    puppeteer.launch = async function () {
        this.browser = await chromium.launch({ args: this.args, headless: this.headless });
        this.page = await this.browser.newPage();
    };

    //puppeteer.close
    puppeteer.close = async function () {
        await this.browser.close();
    };

    //puppeteer.goto
    puppeteer.goto = async function (url) {
        console.log(url);
        await this.page.goto(url);
    }

    //puppeteer.waitMiliSec
    puppeteer.waitMiliSec = async function (miliSeconds) {
        await this.page.waitForTimeout(miliSeconds);
    }

    //puppeteer.waitSec
    puppeteer.waitSec = async function (seconds) {
        await this.page.waitForTimeout(seconds * 1000);
    }

    //set

    //puppeteer.setCookieWithJson
    puppeteer.setCookieWithJson = async function (cookiesJson) {
        await this.page.setCookie(...cookiesJson);
    }

    //get

    //puppeteer.getCookiesObject
    puppeteer.getCookiesObject = async function () {
        return await this.page.cookies();
    }

    //puppeteer.getHTMLStr
    puppeteer.getHTMLStr = async function () {
        return await this.page.content();
    }

    //puppeteer.getElementsByXpath
    puppeteer.getElementsByXpath = async function (Xpath) {
        return await this.page.$x(Xpath);
    }

    //puppeteer.getAtLeastOneElementFromXpathArray
    puppeteer.getAtLeastOneElementFromXpathArray = async function (XpathArry) {
        var element = [];
        for (var Xpath of XpathArry) {
            element = await this.page.$x(Xpath);
            if (element.length)
                break;
        }
        return element;
    }

    //puppeteer.getTextFromElement
    puppeteer.getTextFromElement = async function (element) {
        return await (await element.getProperty('textContent')).jsonValue();
    }

    return puppeteer;
}