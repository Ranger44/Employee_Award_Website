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
  	res.render("index");
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
		//console.log(rows[0]);
		context = rows[0];

		// User is not in database or password is incorrect
		if (context == undefined) {
			console.log("error: username does not exist");
			msg.status = "Invalid username or password. Please try again.";
			res.render("index", msg);
		}

		// User login successful
		else {
			console.log("login successful");
			req.session.user_id = context.id;
			res.redirect('/settings');
		}
	})
});

app.get('/settings',function(req,res){
	var context={};
	mysql.pool.query('SELECT * FROM user_account WHERE id=?', [req.session.user_id], function(err, rows, fields){
		context=rows[0];
		context.image = "css/signatures/" + req.session.user_id + "/" + context.signature;
		console.log(context.image);
		res.render("user_accountSettings", context);
	})	
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
	mysql.pool.query('SELECT time, name, account_award.id, title, email FROM user_account'
					+' INNER JOIN account_award ON user_account.id = account_award.account_id'
					+' INNER JOIN award ON account_award.award_id = award.id'
					+' WHERE user_account.id = ?', [req.session.user_id], function(err, rows, fields){
		context = {rows};
		console.log(context);
		res.render("user_welcome", context);
	})	
});

app.get('/create',function(req,res){
	mysql.pool.query('SELECT title FROM award', function(err, rows, fields){
		context = {rows};
		res.render("user_createAward", context);
	})
});

app.post('/create',function(req,res){
	title = (req.body.title === "Employee of the Month") ? 1 : 2;
	console.log(title);
	console.log(req.body);
	mysql.pool.query("INSERT INTO account_award (`account_id`, `award_id`, `name`, `email`, `time`) VALUES (?,?,?,?,?)",
		[req.session.user_id, title, req.body.name, req.body.email, req.body.time], function(err, result){
			if(err){
				next(err);
				return;
			}
		})
 	res.redirect("/create");
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
	console.log(req.body.email);
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