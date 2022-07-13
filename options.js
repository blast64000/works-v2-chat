var fs = require("fs");
const path = require("path");

const jsonFile = fs.readFileSync(path.resolve(__dirname, "./config/cert.json"), 'utf8');
const jsonData = JSON.parse(jsonFile);

options= jsonData;
options.key = fs.readFileSync(options.key_pwd);
options.cert = fs.readFileSync(options.cert_pwd);
options.ca = fs.readFileSync(options.ca_pwd);

module.exports = options
