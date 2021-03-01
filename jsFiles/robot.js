var Robot = require("robotjs");
const fs = require('fs');
const cv = require('opencv4nodejs');
const Tools = require('./tools');
const screenshot = require('screenshot-desktop')
const spawn = require("child_process").spawn;

const screenImg = '../img/windows/screen.png';
//robot.click
module.exports.click = async function (x, y) {
    Robot.moveMouse(x, y);
    Robot.mouseClick('left');
}
//robot.clickImage
module.exports.clickImage = async function (imageLocation, addX, addY, matchConfidence) {
    if (!addX)
        addX = 0;
    if (!addY)
        addY = 0;
    if (!matchConfidence)
        matchConfidence = 0.95;

    // DeleteOriginal
    try {
        fs.unlinkSync(screenImg);
    } catch (e) {
    }

    // // Wait for imageDelete
    await Tools.waitFileDelete(screenImg, 300, 50);

    // Get Mobile Screen
    await screenshot({ filename: screenImg });

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
    // console.log(minMax.maxVal);
    if (minMax.maxVal < matchConfidence) {
        console.log(imageLocation + ' not found');
        return false;
    }

    // Get click x, y
    const { maxLoc: { x, y } } = minMax;
    const cx = x + findImage.cols / 2 + addX;
    const cy = y + findImage.rows / 2 + addY;
    // console.log("Img x: " + cx + " y: " + cy);
    // Click x, y
    Robot.moveMouse(cx, cy);
    Robot.mouseClick('left');

    return true;
}
//robot.clickUntilImgFound
module.exports.clickUntilImgFound = async function (img, retry) {
    async function clickImage(imageLocation, addX, addY, matchConfidence) {
        if (!addX)
            addX = 0;
        if (!addY)
            addY = 0;
        if (!matchConfidence)
            matchConfidence = 0.95;

        // DeleteOriginal
        try {
            fs.unlinkSync(screenImg);
        } catch (e) {
        }

        // // Wait for imageDelete
        await Tools.waitFileDelete(screenImg, 300, 50);

        // Get Mobile Screen
        await screenshot({ filename: screenImg });

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
        // console.log(minMax.maxVal);
        if (minMax.maxVal < matchConfidence) {
            console.log(imageLocation + ' not found');
            return false;
        }

        // Get click x, y
        const { maxLoc: { x, y } } = minMax;
        const cx = x + findImage.cols / 2 + addX;
        const cy = y + findImage.rows / 2 + addY;
        // console.log("Img x: " + cx + " y: " + cy);
        // Click x, y
        Robot.moveMouse(cx, cy);
        Robot.mouseClick('left');

        return true;
    }
    if (!retry)
        retry = 30;
    var imageFound = false;
    if (Array.isArray(img)) {
        while (!imageFound && retry > 0) {
            for (let i = 0; i < img.length; i++) {
                imageFound = await clickImage(img[i], 0, 0, 0);
                if (imageFound) return;
            }
            retry--;
        }
    } else {
        while (!imageFound && retry > 0) {
            imageFound = await clickImage(img, 0, 0, 0);
            retry--;
        }
    }
    if (imageFound == false)
        throw 'image ' + img + ' is not found!';
}
//robot.captureImage
module.exports.captureImage = async function () {
    // DeleteOriginal
    try {
        fs.unlinkSync(screenImg);
    } catch (e) {
    }
    // // Wait for imageDelete
    await Tools.waitFileDelete(screenImg, 300, 50);
    screenshot({ filename: screenImg });
}
//robot.openExe
module.exports.openExe = function (exeName) {
    return spawn(exeName);
}
//robot.focusExe
module.exports.focusExe = async function (process) {
}
//robot.killExe
module.exports.killExe = async function (process) {
}

async function test() {
    const Robot = require("./robot");
    Robot.clickUntilImgFound('../img/windows/chrome/refresh.png');
}

test();