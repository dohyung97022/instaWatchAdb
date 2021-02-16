const CMD = require("./cmd");
const fs = require('fs');
const cv = require('opencv4nodejs');
const Tools = require('./tools');
const { mainModule } = require("process");

// com.instagram.android

//adb.tapImage
module.exports.tapImage = async function (imageLocation, addX, addY, matchConfidence) {
    if (!addX)
        addX = 0;
    if (!addY)
        addY = 0;
    if (!matchConfidence)
        matchConfidence = 0.95;

    const screenImg = '../img/screen.png';
    // DeleteOriginal
    try {
        fs.unlinkSync(screenImg);
    } catch (e) {
    }

    // // Wait for imageDelete
    await Tools.waitFileDelete(screenImg, 300, 50);

    // Get Mobile Screen
    await CMD.exec('adb shell screencap -p /sdcard/screen.png');
    await Tools.waitMilli(700);
    await CMD.exec('adb pull /sdcard/screen.png ' + screenImg);

    // Wait for imageDownload
    await Tools.waitFileExist(screenImg, 300, 50);

    // Load images in cv
    const originalImage = await cv.imreadAsync(screenImg);
    const findImage = await cv.imreadAsync(imageLocation);

    // Get Matched
    const matched = originalImage.matchTemplate(findImage, 5);

    // Use minMaxLoc to locate the highest value (or lower, depending of the type of matching method)
    const minMax = matched.minMaxLoc();

    // Check confidence
    console.log(minMax.maxVal);
    if (minMax.maxVal < matchConfidence) {
        console.log(imageLocation + ' not found');
        return;
    }

    // Get click x, y
    const { maxLoc: { x, y } } = minMax;
    const cx = x + findImage.cols / 2 + addX;
    const cy = y + findImage.rows / 2 + addY;
    console.log("tapImg " + cx + " " + cy);
    // Click x, y
    await CMD.exec('adb shell input tap ' + cx + ' ' + cy);
}
//adb.tapLocation
module.exports.tapLocation = async function (x, y) {
    await CMD.exec('adb shell input tap ' + x + ' ' + y);
}
//adb.swipe
module.exports.swipe = async function (x, y, x2, y2, millis) {
    await CMD.exec('adb shell input swipe ' + x + ' ' + y + ' ' + x2 + ' ' + y2 + ' ' + millis + ' ');
}
//adb.type
module.exports.type = async function (message, minIntervalMillis, maxIntervalMillis, doReWrite) {
    if (!minIntervalMillis)
        minIntervalMillis = 0;
    if (!maxIntervalMillis)
        maxIntervalMillis = 1000;
    if (!doReWrite)
        doReWrite = false;

    // adb keyboard 확인 및 변경
    const currentKeyboard = await CMD.exec('adb shell settings get secure default_input_method');
    if (currentKeyboard != 'com.android.adbkeyboard/.AdbIME\r\n') {
        await CMD.exec('adb shell ime set com.android.adbkeyboard/.AdbIME');
        await Tools.waitSec(1);
    }
    for (const char of message) {
        if (doReWrite) {
            if (Math.random() < 0.1) {
                await Tools.waitMilli(Tools.getRandomNumberInRange(minIntervalMillis, maxIntervalMillis));
                const randomChar = Tools.getRandomLettersOfLenFromPool(1, 'abcdefghijklmnopqrstuvwxyz');
                const utf8DeleteChar = Buffer.from(randomChar, 'utf-8').toString('base64');
                await CMD.exec('adb shell am broadcast -a ADB_INPUT_B64 --es msg ' + utf8DeleteChar);
                await Tools.waitMilli(Tools.getRandomNumberInRange(minIntervalMillis, maxIntervalMillis));
                await CMD.exec('adb shell input keyevent KEYCODE_DEL');
            }
        }
        await Tools.waitMilli(Tools.getRandomNumberInRange(minIntervalMillis, maxIntervalMillis));
        const utf8Char = Buffer.from(char, 'utf-8').toString('base64');
        await CMD.exec('adb shell am broadcast -a ADB_INPUT_B64 --es msg ' + utf8Char);
    }
}
//adb.typeKeyCode
//http://www.dreamy.pe.kr/zbxe/CodeClip/164608
module.exports.typeKeyCode = async function (keyCode) {
    await CMD.exec('adb shell input keyevent ' + keyCode);
}
//adb.captureImage
module.exports.captureImage = async function () {
    const screenImg = '../img/screen.png';
    // DeleteOriginal
    try {
        fs.unlinkSync(screenImg);
    } catch (e) {
    }

    // // Wait for imageDelete
    await Tools.waitFileDelete(screenImg, 300, 50);

    await CMD.exec('adb shell screencap -p /sdcard/screen.png');
    await Tools.waitMilli(700);
    await CMD.exec('adb pull /sdcard/screen.png ' + screenImg);
}
//adb.openApp
module.exports.openApp = async function (appName) {
    try {
        await CMD.exec('adb shell monkey -p ' + appName + ' 1');
    } catch (e) { }
}
//adb.killApp
module.exports.killApp = async function (appName) {
    await CMD.exec('adb shell am force-stop ' + appName);
}
//adb.clearAppData
module.exports.clearAppData = async function (appName) {
    await CMD.exec('adb shell pm clear ' + appName);
}
//adb.lteOff
module.exports.lteOff = async function () {
    await CMD.exec('adb shell svc data disable');
}
//adb.lteOn
module.exports.lteOn = async function () {
    await CMD.exec('adb shell svc data enable');
}
//adb.getCurrentApp
module.exports.getCurrentApp = async function () {
    return await CMD.exec('adb shell "dumpsys activity activities | grep mResumedActivity"');
}