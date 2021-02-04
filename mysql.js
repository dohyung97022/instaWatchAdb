const mysqlPackage = require('mysql2/promise');
const { mysqlCredentials } = require('./data');

module.exports.new = async function (options) {
    const database = await mysqlPackage.createConnection(mysqlCredentials);
    const mysql = {};
    mysql.puppeteer = 'parameter';

    //mysql.exec
    mysql.exec = async function (query) {
        await database.execute(query);
    }

    //get
    mysql.get = async function (query) {
        const [row] = await database.query(query);
        return row;
    }

    //mysql.getTable
    mysql.getTable = async function (tableName) {
        const [row] = await database.query('SELECT * FROM ' + tableName);
        return row;
    }

    //set

    return mysql;
}