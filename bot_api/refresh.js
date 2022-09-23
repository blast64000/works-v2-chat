const axios = require("axios");
const fs = require("fs");

const options = require("../options.js");
let pay = require("./payload.js");
const fsPromises = fs.promises;


const refreshCode = async function(){
  try{
    let thisReqConfig = axios.create({
      headers: { "x-works-botid":options.botNo },
      baseURL: options.thisUrl,
      timeout: 3000
    });



    apiFunc = await thisReqConfig.post(`refresh`, {clisecret:options.clisecret});

    if(apiFunc.status===200){
      const fileRes = await fs.readFileSync('/home/develop/works-v2-chat/books.txt', { encoding: 'utf8', flag: 'r' });

      let msgReqConfig = axios.create({
        headers: {"Content-Type": `application/json`, 'Authorization': `Bearer ${JSON.parse(fileRes).access_token}`},
        baseURL: 'https://www.worksapis.com/v1.0/bots/',
        timeout: 3000})

        await msgReqConfig.post(`${options.botNo}/users/${options.userId}/messages`,pay["refresh"]);      
    }

    
  }catch(err){
    console.log(err.message);
    console.log(err.name);
    console.log(err.code);
    console.log(err.config);
    
  }
    
/* 
        
        if(apiFunc.data==="refresh value"){
          
          
          );
        }

        */
    }


    refreshCode()