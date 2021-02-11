const puppeteerClass = require('puppeteer');
const chromium = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
chromium.use(StealthPlugin());


module.exports.new = function (settings) {
    const puppeteer = {};
    puppeteer.headless = settings.headless;
    puppeteer.args = settings.args;
    puppeteer.browser = null;
    puppeteer.page = null;

    //puppeteer.launch
    puppeteer.launch = async function () {
        this.browser = await chromium.launch({ args: this.args, headless: this.headless });
        this.page = await this.browser.newPage();

        await this.page.evaluateOnNewDocument(() => {
            window.navigator = {}
        })
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

    //puppeteer.emulate
    puppeteer.emulate = async function (device) {
        await this.page.emulate(puppeteerClass.devices[device]);
    }

    //wait

    //puppeteer.waitMiliSec
    puppeteer.waitMiliSec = async function (miliSeconds) {
        await this.page.waitForTimeout(miliSeconds);
    }

    //puppeteer.waitSec
    puppeteer.waitSec = async function (seconds) {
        await this.page.waitForTimeout(seconds * 1000);
    }

    //puppeteer.waitForSelector
    puppeteer.waitForSelector = async function (selector) {
        await this.page.waitForSelector(selector);
    }

    //puppeteer.waitForXpath
    puppeteer.waitForXpath = async function (Xpath) {
        await this.page.waitForXpath(Xpath);
    }

    //set

    //puppeteer.setCookieWithJson
    puppeteer.setCookieWithJson = async function (cookiesJson) {
        await this.page.setCookie(...cookiesJson);
    }

    //puppeteer.setCookieWithString
    puppeteer.setCookieWithString = async function (string) {
        const cookiesJson = await JSON.parse(string);
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

    //puppeteer.getElementBySelector
    puppeteer.getElementBySelector = async function (selector) {
        return await this.page.$(selector);
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

    //click

    //puppeteer.clickSelector
    puppeteer.clickSelector = async function (selector) {
        await this.page.click(selector);
    }

    //select
    //puppeteer.selectFromDropdown
    puppeteer.selectFromDropdown = async function (dropdownSelector, value) {
        await this.page.select(dropdownSelector, value);
    }

    return puppeteer;
}