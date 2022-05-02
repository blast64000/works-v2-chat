const http =  require('http')
const https = require('https')

const express = require('express')
const bodyParser = require("body-parser")
const options = require("./options.js")
const app = express()
const router = express.Router()

// simple logger for this router's requests
// all requests to this router will first hit this middleware


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));


router.use(function (req, res, next) {
    console.log(Object.keys(req));
  console.log(req.method);
    console.log(req.url);
        console.log(req.body);
  next();
})

// this will only be invoked if the path starts with /bar from the mount point
router.use('/test', function (req, res, next) {
  // ... maybe some additional /bar logging ...
  console.log("haha");
  next()
})


// always invoked
router.use(function (req, res, next) {
    console.log("lala");
    res.send('Hello World')
})

app.use('/test', router);

http.createServer(options, app).listen(80);
https.createServer(options, app).listen(443);