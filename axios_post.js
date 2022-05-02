
const fs = require("fs");
const axios = require("./node_modules/axios");
const qs = require("./node_modules/qs");
const jwt = require('jsonwebtoken');


let nowDateSecond = Math.floor(Date.now() / 1000);
let expDateSecond = Math.floor(Date.now() / 1000) + 60
let objToBase64 = function(x){
  return Buffer.from(JSON.stringify(x)).toString('base64')
}

json_header = { 
  "alg":"RS256",
  "typ":"JWT"
}
json_claim = { 
  "iss":"82DWWRpxARVVFrj3uicA",
  "sub":"h0fgn.serviceaccount@hbcookie.com",
  "iat":nowDateSecond,
  "exp":expDateSecond
}

jwt_header= objToBase64(json_header);
jwt_claim= objToBase64(json_claim);
jwt_value="";

let privateKey = fs.readFileSync('private_20220418181840.key');


jwt.sign(json_claim,privateKey,{algorithm:"RS256"},function(err, token){

  console.log(token);


  let data = qs.stringify({
    'assertion': token,
    'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'client_id': '82DWWRpxARVVFrj3uicA',
    'client_secret': 'MMoxYQdn62',
    'scope': 'bot'
  });

  axios({
    method: "post",
    url: "https://auth.worksmobile.com/oauth2/v2.0/token",
    headers : { 
      "content-Type" : 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': 'WORKS_LOC=kr1; WORKS_RE_LOC=kr1; WORKS_TE_LOC=kr1'
    },
    data: data 
  })
  .then(function (response) {
    console.log(response.data);



    })
  .catch(function (error) {
    console.log(error);
  });
})



