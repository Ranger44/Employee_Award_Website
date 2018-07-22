var express = require('express');
var app = express();
var mysql = require('./dbcon.js');
var handlebars = require('express-handlebars');
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('port', 50111);
app.use(express.static("public"));
app.set("view engine", "handlebars");
app.set('mysql', mysql);
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
// Use helper functions if needed
//helpers: require(__dirname + "/public/js/helpers.js").helpers,      
    partialsDir: __dirname + '/views/partials'
}));

/*******************************************************
 NODEMAILER - for verification email on account creation
******************************************************/
// let transporter = nodemailer.createTransport({
//   service: 'gmail',
//   secure: false,
//   port: 25,
//   auth: {
//     user: 'noreply.group9@gmail.com',
//     pass: 'wethebest'
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });


// app.get('/',function(req,res){


//   let HelperOptions = {
//     from: '"Group9" <noreply.group9@gmail.com',
//     to: 'noreply.group9@gmail.com',
//     subject: 'Verfication Email',                                                                                         
//     text: 'this is a test'
//   };

//  transporter.sendMail(HelperOptions, (error, info) => {
//     if (error) {
//       return console.log(error);
//     }
//   });
//    res.render("index");
// });

app.get('/',function(req,res){
  	res.render("index");
});

app.post('/',function(req,res){
	console.log(req.body.email);
	console.log(req.body.password);
	var context = {};
	var msg = {};
	mysql.pool.query('SELECT * FROM bsg_account WHERE username=?', [req.body.email], function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		//console.log(rows[0]);
		context = rows[0];

		if (context == undefined) {
			console.log("error: username does not exist");
			msg.status = "Invalid username or password. Please try again.";
			res.render("index", msg);
		}
		else {
			res.render("index");
		}
	})
});

app.get('/forgot_password',function(req,res){
 	 res.render("forgot_password");
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