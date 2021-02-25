const { exec } = require("child_process");

module.exports.exec = function (command) {
    return new Promise(function (resolve, reject) {
        exec(command, function (error, standardOutput, standardError) {
            if (error) {
                console.log(`error: ${error.message}`);
                reject();
                return;
            }
            if (standardError) {
                console.log(`standardError: ${standardError}`);
                reject(standardError);
                return;
            }
            // console.log(`standardOutput: ${standardOutput}`);
            resolve(standardOutput);
        });
    });
}