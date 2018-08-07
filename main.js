/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/
var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var date = require('node-datetime');

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

app.get('/admin_award', function (req, res, next) {
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
  displayEmployeeData(res);

});

app.use('/admin_insert_em',function(req, res, next){
	insertEmployee(req,res,next);
});

app.use('/admin_delete_en',function(req,res,next){
	deleteEmployee(req,res,next);
});

app.use('/admin_edit_en',function(req,res,next){
	editEmployee(req,res,next);
});

app.use('/admin_view_en',function(req,res,next){
	viewAwardEmployee(req,res,next);
});

app.use('/admin_update_en',function(req,res,next){
	updateEmployee(req,res,next);
});

app.use('/admin_insert_em_aw',function(req,res,next){
	insertEmployeeAward(req,res,next);
});

app.use('/admin_delete_en_aw',function(req,res,next){
	deleteEmployeeAward(req,res,next);
});
app.use('/admin_account', function (req, res, next) {
	viewUserAccount(req,res,next);
	//res.render('admin_account');
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

/********************
* Employee
*********************/

var displayEmployeeData = function(res){
  var context= {};
	var dataRow = {};
	dataRow.employeeData = [];

	//mysql.pool.query("SELECT em.id,em.firstname,em.lastname,em.email,ae.date,ae.description,a.name as nameAward,a.description as descriptionAward FROM bsg_employee em LEFT JOIN bsg_award_employee ae ON em.id = ae.idemployee LEFT JOIN bsg_award a ON ae.idaward = a.id",
		mysql.pool.query("SELECT * from bsg_employee",
			function(err,rows,fields){
				if(err){
					console.log(err);
					return;
				}
				for(row in rows){
					dataOfRow={};
					dataOfRow.id 		  		= rows[row].id;
					dataOfRow.firstname 	= rows[row].firstname;
					dataOfRow.lastname 		= rows[row].lastname;
					dataOfRow.email				= rows[row].email;
					dataOfRow.address	 	  = rows[row].address;
					//dataOfRow.date				= rows[row].date;
					//dataOfRow.description = rows[row].description;
					//dataOfRow.nameAward 	= rows[row].nameAward;
					//dataOfRow.descriptionAward = rows[row].descriptionAward;
					//console.log("Id: %d",dataOfRow.id );
					//console.log("Firstname: %s",dataOfRow.firstname );
					dataRow.employeeData.push(dataOfRow);
				}
					context.results = JSON.stringify(rows);
					context.data = dataRow;
					res.render('admin_employee',context);
			}
	);
};

var insertEmployee = function(req,res,next){
//console.log("first name: %s",req.query.firstname);
	mysql.pool.query("INSERT INTO bsg_employee (`firstname`,`lastname`, `email`,`address`) VALUES(?,?,?,?)",
				[req.query.firstname, req.query.lastname, req.query.email, req.query.address],
		function(err){
			if(err){
				console.log(err);
				return;
			}
			displayEmployeeData(res);
		}
	);
};

var editEmployee = function(req,res,next){
	var context={};

	mysql.pool.query("SELECT * FROM bsg_employee WHERE id=?",[req.query.id],
		function(err,result){
			if(err){
				console.log(err);
				return;
			}
			context.id = result[0].id;
			context.firstname = result[0].firstname;
			context.lastname = result[0].lastname;
			context.email = result[0].email;
			context.address = result[0].address;
			res.render('admin_employee_edit',context);
		}
	);
};

var updateEmployee = function(req,res,next){
	mysql.pool.query("UPDATE bsg_employee SET firstname=?,lastname=?,email=?,address=? WHERE id=?",[req.query.firstname,req.query.lastname,req.query.email,req.query.address,req.query.id],
		function(err){
			if(err){
				console.log(err);
				return;
			}
			displayEmployeeData(res);
		}
	);
};

var deleteEmployee = function (req,res,next){
	var context={};
	mysql.pool.query("DELETE FROM bsg_employee WHERE id=?",[req.query.id],
		function(err,result){
			if(err){
				next(err);
				return;
			}
			context.results = "Deleted "+result.changedRows + "row.";
			res.render('admin_employee',context);
		}
	);

};

var viewAwardEmployee = function (req,res,next){
	var context={};
	var dataRow={};
	dataRow.nameEmployee=[];
	dataRow.awardData=[];
	dataRow.award=[];
	// console.log("id employee: %s",req.query.id);
	// console.log("first: %s",req.query.first);
	// console.log("last: %s",req.query.last);
	var name={};
	name.id=req.query.id;
	name.firstName = req.query.first;
	name.lastName  = req.query.last;
  dataRow.nameEmployee.push(name);

  mysql.pool.query("SELECT a.id, a.idaward as idaward, b.name,b.description,a.date FROM bsg_award_employee a INNER JOIN bsg_award b ON a.idaward = b.id WHERE a.idemployee = ?",[req.query.id],
		function(err,rows,fields){
			if(err){

				next(err);
				return;
			}

			for(row in rows){

				var dataOfRow={};
				dataOfRow.id = rows[row].id;
				dataOfRow.idaward = rows[row].idaward;
				dataOfRow.name = rows[row].name;
				dataOfRow.description = rows[row].description;
				dataOfRow.date = rows[row].date;

				// console.log("idaward: %s",dataOfRow.idaward);
				// console.log("name: %s",dataOfRow.name);
				// console.log("description: %s",dataOfRow.description);
				dataRow.awardData.push(dataOfRow);
			}
		//	context.results = JSON.stringify(rows);
		mysql.pool.query("SELECT id, name FROM bsg_award",
			function(err,rows){
				if(err){
					next(err);
				}
				for(row in rows){
					var dataOfRow={};
					dataOfRow.id = rows[row].id;
					dataOfRow.name = rows[row].name;
					dataRow.award.push(dataOfRow);
				}
				//	context.results = JSON.stringify(rows);
				context.data = dataRow;
			 res.render('admin_employee_award',context);
			});

		}

	);

};

var insertEmployeeAward = function(req,res,next){

	//console.log("ID: %s",req.query.award);
	var dt = date.create();
	var formatted = dt.format('Y-m-d H:M:S');
	// var formatted = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	console.log(formatted);

	mysql.pool.query("INSERT INTO bsg_award_employee (`idaward`,`date`, `idemployee`) VALUES(?,?,?)",
				[req.query.award, formatted, req.query.id],
		function(err){
			if(err){
				console.log(err);
				return;
			}
	  		viewAwardEmployee(req,res,next);
		}
	);
};

var deleteEmployeeAward = function(req,res,next){
	//console.log("ID Delete: %s",req.query.id);
	mysql.pool.query("DELETE FROM bsg_award_employee WHERE id=?", [req.query.id], function (err, result) {
		if (err) {
			next(err);
			return;
		}

	});
};

/********************************************
*********************************************/
var viewUserAccount = function(req,res,next){
	var context= {};
	var dataRow = {};
	dataRow.accountData = [];

	//mysql.pool.query("SELECT em.id,em.firstname,em.lastname,em.email,ae.date,ae.description,a.name as nameAward,a.description as descriptionAward FROM bsg_employee em LEFT JOIN bsg_award_employee ae ON em.id = ae.idemployee LEFT JOIN bsg_award a ON ae.idaward = a.id",
		mysql.pool.query("SELECT * from user_account",
			function(err,rows,fields){
				if(err){
					console.log(err);
					return;
				}
				for(row in rows){
					dataOfRow={};
					dataOfRow.id 		  		= rows[row].id;
					dataOfRow.fname 			= rows[row].fname;
					dataOfRow.lname 			= rows[row].lname;
					dataOfRow.username		= rows[row].username;
					dataOfRow.password	 	= rows[row].password;
					dataOfRow.timestamp	 	= rows[row].timestamp;

					dataRow.accountData.push(dataOfRow);
				}
					context.results = JSON.stringify(rows);
					context.data = dataRow;
					res.render('admin_account',context);

			}
	);
};
