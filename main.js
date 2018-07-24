/*  
    Uses express, dbcon for database connection, body parser to parse form data 
    handlebars for HTML templates  
*/
var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);
app.use('/', express.static('public'));

app.use('/admin', function (req, res, next){

	displayAwardData(res);
});

app.use('/admin_award', function (req, res, next) {
	displayAwardData(res);
	
});

app.use('/admin_insert_aw', function (req, res, next) {
	insertAward(req, res, next);
	
});

app.use('/admin_delete_aw', function (req, res, next) {
	deleteAward(req, res, next);

});

app.use('/admin_edit_aw', function (req, res, next) {
	editAward(req, res, next);
});

app.use('/admin_update_aw', function (req, res, next) {
	updateAward(req, res, next);
});

app.use('/admin_employee', function (req, res, next) {

	res.render('admin_employee');
});


app.use('/admin_account', function (req, res, next) {

	res.render('admin_account');
});


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

/*********************************************************************************************
 * Award Data
 * *******************************************************************************************/

var displayAwardData = function (res) {

	var context = {};
	var row_data = {};
	row_data.award = [];

	mysql.pool.query("SELECT * FROM bsg_award", function (err, rows, fields) {
		if (err) {
			console.log(err);
			return;
		}

		for (row in rows) {
			simple_award = {};
			simple_award.id			 = rows[row].id;
			simple_award.name		 = rows[row].name;
			simple_award.description = rows[row].description;

			row_data.award.push(simple_award);
		}

		context.results = JSON.stringify(rows);
		context.data = row_data;
		res.render('admin_award',context);
	});

};

var insertAward = function (req, res,next) {
	//console.log("name: %s", req.query.name);
	//console.log("description: %s", req.query.description);
	mysql.pool.query("INSERT INTO bsg_award(`name`,`description`) VALUES(?,?)",
						[req.query.name, req.query.description], function (err, result) {

		if (err) {
			next(err);
			return;
		}
		displayAwardData(res);
	});
};

var deleteAward = function (req, res, next) {
	//console.log("name: %s", req.query.name);
	//console.log("description: %s", req.query.description);
	mysql.pool.query("DELETE FROM bsg_award WHERE id=?", [req.query.id], function (err, result) {
		if (err) {
			next(err);
			return;
		}

		//context.results = "Deleted " + result.changedRows + " rows.";
		displayAwardData(res);
	});
};

var editAward = function (req, res, next) {
	var context = {};
	var row_data = {};
	row_data.award = [];

	//console.log("ID: %d", req.query.id);
	mysql.pool.query("SELECT * FROM bsg_award WHERE id=?", [req.query.id], function (err, result) {
		if (err) {
			next(err);
			return;
		}
		context.id = result[0].id;
		context.name = result[0].name;
		context.description = result[0].description;
		res.render('admin_award_edit', context);
	});
	
	
};

var updateAward = function (req, res, next) {
	mysql.pool.query("UPDATE bsg_award SET name=?, description=? WHERE id=?", [req.query.name, req.query.description, req.query.id], function (err, result) {
		if (err) {
			next(err);
			return;
		}
		displayAwardData(res);
	});
};