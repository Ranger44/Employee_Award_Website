var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_straleyh',
  password        : '4961',
  database        : 'cs340_straleyh'
});
module.exports.pool = pool;
