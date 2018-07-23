var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs467-group1',
  password		  : 'E3NTBHHRrK8gxUbA',
  database		  : 'cs467-group1'
});
module.exports.pool = pool;
