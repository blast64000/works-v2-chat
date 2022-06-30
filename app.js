const fs = require("fs");
const fsPromises = fs.promises;
const axios = require("axios");
const qs = require("qs");
const jwt = require('jsonwebtoken');
const path = require("path")


const http =  require('http')
const https = require('https')

const express = require("express")
const bodyParser = require("body-parser")
const options = require("./options.js")
const initFunc = require("./axios_post.js")

const app = express()

let const_value ={};

const initialize = async function(){
  let res = await initFunc.getJWT();
  console.log(JSON.stringify(res));
  await fsPromises.writeFile("books.txt", JSON.stringify(res)+`\n`, {encoding: "utf8",flag: "w",mode: 0o666});
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.all('*', function(req,res,next){
    const { headers, method, url } = req;    
    console.log(`\n== check all input method: ${method}, url :${url} ==`);
    next();
});

app.get("/*",function(req,res){
    const { headers, method, url } = req;    
    console.log(url);
    if(url==="/udca.png"){
    res.sendFile(path.join(__dirname,url.replace(";","")));
    }
    else { 
        res.status(404).send(`Sorry, we cannot find that!`)
    }
});

app.post("/",function(req,res){
    console.log("\n== check post input ==");
    console.log(req.headers);
    console.log(req.body);
});

app.post("/test",function(req,res){
//    console.log(Object.keys(req));
    console.log(req.body);
    res.end()
});

initialize();
https.createServer(options, app).listen(80);
https.createServer(options, app).listen(443);