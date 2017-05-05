var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();

var connections = mysql.createPool({
    limit : 20,
    server : 'localhost',
    user : 'root',
    password : '',
    database : 'ccwebshop',
    debug : 'true'
});

app.use(express.static(__dirname + '/client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// web static routes
app.get('/', function(req,res){
    res.sendFile('index.html', {root:'../client/'});
});

app.use(express.static("../client/"));


// api server routes
// user login
app.post("/api/login",function(req,res){
 
 var username = req.body.username;
 var password = req.body.password;
 
 // check if we have username and password filled in from client
 if(!username || !password){
     return res.json({error:"Username or password not filled in !"});
 }

 // dig into database to validate login
 connections.getConnection(function(err,connection){

    // if connection failed return error 
    if(err){
         connection.release();
         return res.json(err);
    }

    // execute query to see if user exists in database
    var query = "SELECT * from user where username='" + username + 
                "' AND password='" + password + "'";

    connection.query(query, function(err, rows, fields) {
        connection.release();        
        if (!err && parseInt(rows.length) > 0){
            return res.json(rows);
        } else {
            return res.json(err);
        }
    });
    
 });

});

// user registration
app.post('/api/register', function(req,res){

    var username = req.body.username;
    var password = req.body.password;

    if(!username || !password){
         return res.json({error:"Username or password not filled in !"});
    }

    connections.getConnection(function(err,connection){
     
        if(err){
            connection.release();
            return res.json({error : err});
        }

        var query = "SELECT COUNT(*) AS numUsers FROM user WHERE username='" + username + "'";

        connection.query(query, function(err,rows,fields){
            connection.release();
            if (!err && parseInt(rows[0].numUsers) === 0){
                
                query = "INSERT INTO user(username,password) VALUES('" + username + "','" + password + "')";

                connection.query(query, function(err,rows, fields){

                    if (!err){
                        return res.json({registered:true});
                    } else {
                        console.log(err);
                        return res.json({registered:false});
                    }
                });

            } else {
                console.log(err);
                return res.json({registered:false});
            }

        });

    });

});

app.get('/api/checkuser', function(req,res){
    var username = req.query.username;

    if(!username){
        return res.json({error:"Please supply username"});
    }

    var query = "SELECT COUNT(*) AS numUsers FROM user WHERE username='" + username + "'";

    connections.getConnection(function(err, connection){
        
        if(err){
            connection.release();
            return res.json({error:err});
        }

        connection.query(query, function(err,rows,fields){
            connection.release(); 
            if(err){
                return res.json({error:err});
            }

            if(parseInt(rows[0].numUsers) === 0){
                return res.json({available:true});
            } else {
                return res.json({available:false});
            }

        });

    });
});

var server = app.listen(4000,function(){
    var output = "<< Code Campers web shop === Development server === >>\n";
    console.log(output + "Server listening at port : " + server.address().port);
});