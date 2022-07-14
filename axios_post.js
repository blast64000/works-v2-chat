
const qs = require("qs");
const jwt = require('jsonwebtoken');
const fs = require("fs");
const axios = require("axios");
const options = require("./options.js")



module.exports.getJWT = function(){
  return new Promise(function(resolve,reject){


    
      let privateKey = fs.readFileSync('./config/private_20220622084023.key');
      let nowDateSecond = Math.floor(Date.now() / 1000);
      let expDateSecond = Math.floor(Date.now() / 1000) + 60
      
      json_claim = { 
        "iss":options.iss,
        "sub":options.sub,
        "iat":nowDateSecond,
        "exp":expDateSecond
      }
    
      try{
        jwt.sign(json_claim,privateKey,{algorithm:"RS256"},function(err, token){
    
        if(token){
          let reqString = qs.stringify({
            'assertion': token,
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'client_id': options.iss,
            'client_secret': options.clisecret,
            'scope': 'bot,user.email.read'
          });
        
  
          axios({
            method: "post",
            url: "https://auth.worksmobile.com/oauth2/v2.0/token",
            headers : { 
              "content-Type" : 'application/x-www-form-urlencoded; charset=UTF-8',
              'Cookie': 'WORKS_LOC=kr1; WORKS_RE_LOC=kr1; WORKS_TE_LOC=kr1'
            },
            data: reqString }).then(function (response) {
              resolve(response.data);
              })
        }
    
        else {
          throw new Error(`jwt token make error`);
        }
      });
  
    }catch(e){
      console.log(e);
      throw new Error(`response error`);
    }

  });


}