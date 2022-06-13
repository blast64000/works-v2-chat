
const fs = require("fs");
const axios = require("axios");
const qs = require("qs");
const jwt = require('jsonwebtoken');


module.exports.getJWT = function(iss, sub){

  let privateKey = fs.readFileSync('./config/private_20220418181840.key');
  let nowDateSecond = Math.floor(Date.now() / 1000);
  let expDateSecond = Math.floor(Date.now() / 1000) + 60
  

  json_claim = { 
    "iss":"82DWWRpxARVVFrj3uicA",
    "sub":"h0fgn.serviceaccount@hbcookie.com",
    "iat":nowDateSecond,
    "exp":expDateSecond
  }
  
  jwt.sign(json_claim,privateKey,{algorithm:"RS256"},function(err, token){

    if(token){
      let reqString = qs.stringify({
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
        data: reqString 
      }).then(function (response) {
        console.log(response.data);
        return response.data
        }).catch(function (error) {
          console.log(error);
          });
    }

    else {
      console.log("jwt token make error"+"\n"+err);
    }
    
  });
}
