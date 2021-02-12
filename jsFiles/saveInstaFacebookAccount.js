const prompt = require('prompt-sync')();
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');

async function main() {
    const mysql = await Mysql.new();
    while (1) {
        var id = prompt('nickName : ');
        var registeredEmail = prompt('registeredEmail : ');
        var password = prompt('password : ');

        if (id == null || registeredEmail == null || password == null)
            process.exit(1);

        await mysql.exec(MysqlQuery.getInsertInstaAccountQuery(id, password, registeredEmail));
        await mysql.exec(MysqlQuery.getInsertFacebookAccountQuery(id, password, registeredEmail));

        console.log("saved")
    }
}

main();