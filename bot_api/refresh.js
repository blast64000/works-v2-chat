const axios = require("axios");
const fs = require("fs");

const options = require("../options.js");
let pay = require("./payload.js");
const fsPromises = fs.promises;


console.log(options.clisecret);

const refreshCode = async function(){

    reqConfig2 = axios.create({
      headers: { "x-works-botid":options.botNo },
      baseURL: 'https://hbcookie.com/',
      timeout: 3000});
        apiFunc = await reqConfig2.post(`refresh`, {clisecret:options.clisecret});
        if(apiFunc.data==="refresh value"){
          msgret = await reqConfig2.post(`${options.clisecret}/users/${options.userId}/messages`, 
          
          );
        }
    }


    refreshCode()