const http =  require('http')
const https = require('https')

const express = require("express")
const bodyParser = require("body-parser")
const options = require("./options.js")
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.all('*', function(req,res,next){
    console.log("check all input")
    console.log(req.headers);
    console.log(req.body);
    next();
});

app.get("/",function(req,res,next){
    console.log(req.body);
});

app.post("/",function(req,res){
    console.log("/")
    console.log(req.params);
});

app.post("/test",function(req,res){
//    console.log(Object.keys(req));
    console.log(req.body);
    res.end()
});

http.createServer(options, app).listen(80);
https.createServer(options, app).listen(443);