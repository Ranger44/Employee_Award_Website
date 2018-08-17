var express = require('express');
var app = express();
var mysql = require('./dbcon.js');
var handlebars = require('express-handlebars');
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var session = require("express-session");
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: '/tmp/'});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('port', 50113);
app.use(express.static("public"));
app.set("view engine", "handlebars");
app.set('mysql', mysql);
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
// Use helper functions if needed
//helpers: require(__dirname + "/public/js/helpers.js").helpers,
    partialsDir: __dirname + '/views/partials'
}));
app.use(session({
	secret:'SuperSecretPassword',
	resave: false,
	saveUninitialized: true
}));



function checkIsUserLoggedIn(id) {
	return (id == -1 || id == undefined);
}

/*******************************************************
 NODEMAILER - for verification email on account creation
******************************************************/
let transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  port: 25,
  auth: {
    user: 'noreply.group9@gmail.com',
    pass: 'wethebest'
  },
  tls: {
    rejectUnauthorized: false
  }
});


app.get('/',function(req,res){
  	res.redirect("/login");
});

app.get('/login',function(req,res){
  	res.render("index");
});

app.get('/logout',function(req,res){
	req.session.user_id = -1;
  	res.redirect("/login");
});

app.post('/',function(req,res){
	var context = {};
	var msg = {};
	mysql.pool.query('SELECT * FROM user_account WHERE username=? AND password=?',
		[req.body.email, req.body.password], function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		context = rows[0];

		// User is not in database or password is incorrect
		if (context == undefined) {
			console.log("error: username does not exist");
			msg.status = "Invalid username or password. Please try again.";
			res.render("index", msg);
		}

		// User login successful
		else {
			req.session.user_id = context.id;
			if (context.type === 1) {	//admin user
				res.redirect('/admin_welcome');
			}
			else {
				res.redirect('/settings');
			}
		}
	})
});

app.get('/settings',function(req,res){
	if (checkIsUserLoggedIn(req.session.user_id)) res.redirect("/login");
	else{
		var context={};
		mysql.pool.query('SELECT * FROM user_account WHERE id=?', [req.session.user_id], function(err, rows, fields){
			context=rows[0];
			context.image = "css/signatures/" + req.session.user_id + "/" + context.signature;
			res.render("user_accountSettings", context);
		})
	}
});

app.post('/updateSettings', function(req,res){
	mysql.pool.query('UPDATE user_account SET fname=?, lname=? WHERE id=?',
		[req.body.fname, req.body.lname, req.session.user_id], function(err, rows, fields){
			if(err){
				next(err);
				return;
			}
			res.redirect('/settings');
		}
	)
})

app.get('/reports',function(req,res){
	if (checkIsUserLoggedIn(req.session.user_id)) res.redirect("/login");
	else {
		mysql.pool.query('SELECT time, name, account_award.id, title, email FROM user_account'
						+' INNER JOIN account_award ON user_account.id = account_award.account_id'
						+' INNER JOIN award ON account_award.award_id = award.id'
						+' WHERE user_account.id = ?', [req.session.user_id], function(err, rows, fields){
			context = {rows};
			res.render("user_welcome", context);
		})
	}
});

app.get('/create',function(req,res){
	if (checkIsUserLoggedIn(req.session.user_id)) res.redirect("/login");
	else {
		mysql.pool.query('SELECT title FROM award', function(err, rows, fields){
			context = {rows};
			res.render("user_createAward", context);
		})
	}
});

app.post('/create',function(req,res){
	mysql.pool.query("INSERT INTO account_award (`account_id`, `award_id`, `name`, `email`, `time`) VALUES (?,?,?,?,?)",
		[req.session.user_id, req.body.title, req.body.name, req.body.email, req.body.time], function(err, result){
			if(err){
				//next(err);
				return;
			}
				const exec = require('child_process').exec;
				var script = exec('bash bash_retr.sh', 
					(error, stdout, stderr) => {
					console.log(`${stdout}`);
					console.log(`${stderr}`);
						if (error !== null) {
							console.log(`exec error: ${error}`);
						}
				});
		 	res.redirect("/reports");
	})
});

app.post('/deleteReward' ,function(req,res){
	mysql.pool.query('DELETE FROM account_award WHERE id=?', [req.body.id], function(err,rows,fields){
		if(err){
			next(err);
			return;
		}
		res.redirect('/reports');
	})
});

app.post('/image', upload.single("file"), function (req, res) {
	if (!fs.existsSync(__dirname + "/public/css/signatures/" + req.session.user_id)) {
		fs.mkdirSync(__dirname + "/public/css/signatures/" + req.session.user_id);
	}
   var file = __dirname + "/public/css/signatures/" + req.session.user_id + "/"+ req.file.originalname;
   fs.readFile(req.file.path, function (err, data) {
        fs.writeFile(file, data, function (err) {
         if( err ){
              console.error( err );
              response = {
                   message: 'Sorry, file couldn\'t be uploaded.',
                   filename: req.file.originalname
              };
         }else{
               response = {
                   message: 'File uploaded successfully',
                   filename: req.file.originalname
              };
          }
       });
   });
   mysql.pool.query('UPDATE user_account SET signature=? WHERE id=?',
   	[req.file.originalname, req.session.user_id], function(err, result){
   		if(err){
   			next(err);
   			return;
   		}
   	res.redirect("settings");
   	})
})

app.get('/forgot_password',function(req,res){
 	res.render("forgot_password");
});

app.post('/sendPassword', function(req, res){
	var msg={};

	mysql.pool.query('SELECT * FROM user_account WHERE username=?', [req.body.email], function(err, rows, fields){
		context=rows[0];

		if (context == undefined) {
			msg.status = "Email is not in database";
			res.render("forgot_password", msg);
		}
		else {
			let HelperOptions = {
    			from: '"Group9" <noreply.group9@gmail.com',
    			to: req.body.email,
    			subject: 'Password Retriever',
    			text: 'Your password is: ' + context.password
  			};

 			transporter.sendMail(HelperOptions, (error, info) => {
    			if (error) {
      				return console.log(error);
    			}
    			else {
    				msg.status = "Password has been sent";
    				res.render("forgot_password", msg);
    			}
  			});
 		}
	})
})

app.get('/admin_welcome', function(req,res){
	if (checkIsUserLoggedIn(req.session.user_id)) res.redirect("/login");
	else{
		mysql.pool.query('SELECT * FROM user_account', function(err, rows, fields){
			for(var i = 0; i < rows.length; i++) {
				if(rows[i].id === req.session.user_id) {
					rows[i].isUser = 1;
					break;
				}
				else {
					rows[i].isUser = 0;
				}
			}
			context = {rows};
			res.render('admin_welcome', context);
		})
	}
})

app.get('/adminEdit', function(req,res){
	if (checkIsUserLoggedIn(req.session.user_id)) res.redirect("/login");
	else {
		mysql.pool.query('SELECT * FROM user_account WHERE id=?',
			[req.query.id], function(err, rows, fields){
				context = rows[0];
				res.render('admin_editUser', context);
		})
	}
})

app.post('/adminEdit', function(req,res){
	mysql.pool.query('SELECT * FROM user_account', function(err, rows, fields){
		var validEmail = true;
		for(var i = 0; i < rows.length; i++) {
			if (req.body.email == rows[i].username && req.body.id != rows[i].id) {
				validEmail = false;
				break;
			}
		}
		if(validEmail) {
			mysql.pool.query('UPDATE user_account SET fname=?, lname=?, username=?, password=?, type=? WHERE id=?',
				[req.body.fname, req.body.lname, req.body.email, req.body.password, req.body.userType, req.body.id],
					function(err, rows, fields){
						if(err){
							return;
						}
					res.redirect('/admin_welcome');
				})
		}
		else {
			mysql.pool.query('SELECT * FROM user_account WHERE id=?',
				[req.body.id], function(err, rows, fields){
					context = rows[0];
					context.status = req.body.email + " is already registered to another user";
					res.render('admin_editUser', context);
			})
		}
	})
})

app.post('/adminDelete', function(req,res){
	console.log(req.body.id);
	mysql.pool.query('DELETE FROM user_account WHERE id=?',
		[req.body.id], function(err, rows, fields){
			if(err){
				next(err);
				return;
			}
			res.redirect('/admin_welcome');
	})
})

app.get('/adminCreate',function(req,res){
	if (checkIsUserLoggedIn(req.session.user_id)) res.redirect("/login");
	else {
		checkIsUserLoggedIn(req.session.user_id);
  		res.render("admin_createNewUser");
  	}
});

app.post('/adminCreate',function(req,res){
	console.log(req.body);
	mysql.pool.query('SELECT * FROM user_account', function(err, rows, fields){
		var validEmail = true;
		for(var i = 0; i < rows.length; i++) {
			if (req.body.email == rows[i].username) {
				validEmail = false;
				break;
			}
		}
		console.log(validEmail);
		if(validEmail) {
			mysql.pool.query('INSERT INTO user_account (`fname`, `lname`, `username`, `password`, `type`) VALUES (?,?,?,?,?)',
				[req.body.fname, req.body.lname, req.body.email, req.body.password, req.body.userType],
					function(err, rows, fields){
						if(err){
							return;
						}
					res.redirect('/admin_welcome');
				})
		}
		else {
			context.status = req.body.email + " is already registered to another user";
			res.render('admin_createNewUser', context);
		}
	})
});
app.use('/adminreport',function(req,res,next){
  if (checkIsUserLoggedIn(req.session.user_id)) res.redirect("/login");
  else{
      res.render('admin_report');
  }
});


app.use('/getAwardData',function(req,res,next){
	createJsonAward(req,res,next);
});

app.use('/getAccountData',function(req,res,next){
	createJsonAccount(req,res,next);
});

app.use(function(req,res){
	res.render("404")
});

app.use(function(err, req, res, next){
  	console.error(err.stack);
	res.render("500")
});

app.listen(app.get('port'), function(){
  	console.log('Express started on http://localhost:' + app.get('port') +
    '; press Ctrl-C to terminate.');
});


var createJsonAward = function(req,res,next){

	mysql.pool.query("SELECT aw.title, COUNT(ac.award_id) as number from account_award ac RIGHT JOIN award aw ON ac.award_id = aw.id GROUP BY aw.id",
		function(err,datarows){
			if(err){
				console.log(err);
				return;
			}else{
						var content={
								cols:[],
								rows:[]
						};
						content.cols.push({id: "",label: "Topping",pattern: "",type:"string"});
						content.cols.push({id: "",label: "Slices",pattern:  "",type:"number"});

						for(row in datarows){
							var dataRow={
								c:[]
							};
							dataRow.c.push({v: datarows[row].title,f: null});
							dataRow.c.push({v: datarows[row].number,f: null});
							var json1 = JSON.stringify(dataRow);

							content.rows.push(dataRow);
						}
						var json = JSON.stringify(content);
						res.send(json);
			}
		}
	);
  //Format of Json
	// contentSample = {
	// 				"cols": [
	// 							{"id":"","label":"Topping","pattern":"","type":"string"},
	// 							{"id":"","label":"Slices","pattern":"","type":"number"}
	// 						],
	// 				"rows": [
	// 							{"c":[{"v":"Mushrooms","f":null},{"v":1,"f":null}]},
	// 							{"c":[{"v":"Onions","f":null},{"v":2,"f":null}]},
	// 							{"c":[{"v":"Olives","f":null},{"v":3,"f":null}]},
	// 							{"c":[{"v":"Zucchini","f":null},{"v":4,"f":null}]},
	// 							{"c":[{"v":"Pepperoni","f":null},{"v":2,"f":null}]}
	// 						]
	// 	}

}

var createJsonAccount = function(req,res,next){
	mysql.pool.query("SELECT a.fname as firstname, a.lname as lastname, count(ac.award_id) as number FROM user_account a LEFT JOIN account_award ac ON a.id = ac.account_id GROUP BY a.fname",
	function(err,datarows){
		if(err){
			console.log(err);
			return;
		}else{
			var content={
					cols:[],
					rows:[]
			};
			content.cols.push({id: "",label: "Topping",pattern: "",type:"string"});
			content.cols.push({id: "",label: "Slices",pattern:  "",type:"number"});

			for(row in datarows){
				var dataRow={
					c:[]
				};
				dataRow.c.push({v: datarows[row].firstname,f: null});
				dataRow.c.push({v: datarows[row].number,f: null});
				var json1 = JSON.stringify(dataRow);

				content.rows.push(dataRow);
			}
			var json = JSON.stringify(content);
			res.send(json);
		}
	});
}
