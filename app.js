var express = require('express');
var app = express();
var mysql = require('./dbcon.js');
var handlebars = require('express-handlebars');
var bodyParser = require("body-parser");

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

app.get('/',function(req,res){
  res.render("index");
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