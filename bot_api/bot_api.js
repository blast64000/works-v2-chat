
const qs = require("qs");
const fs = require("fs");
const axios = require("axios");
let pay = require("./payload.js");
const FormData = require('form-data');
const request = require('request');
let options = require("../options.js")

let baseHeaders={
  'Authorization': "Bearer ",
    "Content-Type": `application/json`
};

//let emailArray = ["jwkim023@daewoong.co.kr","changwolf@daewoong.co.kr","pys1210@daewoong.co.kr","yjlee230@daewoong.co.kr","jsjang303@daewoong.co.kr","mjha026@daewoong.co.kr","2230015@daewoong.co.kr","2210381@daewoong.co.kr","anmin33@daewoong.co.kr","pyh@daewoong.co.kr","2210493@daewoong.co.kr","2210432@daewoong.co.kr","hjlee301@daewoong.co.kr","2230012@daewoong.co.kr","jwkim023@daewoong.co.kr"];
let emailArray = ["jwkim023@daewoong.co.kr"]
  msgObj={
    "content": {
      "type": "text",
      "text": `[챗봇 단체 메세지 베타 테스트] \n안녕하세요 오늘부로 Wifi 비밀번호가 변경됩니다. \n 비밀번호 확인하시어 업무에 참고하시기 바랍니다.\n 팁 : #wifi를 검색하시면 쉽게 확인가능\n
[DW_Main]
C@@H24276

[DW_FMC_5G]
C@@H24276

[DW_FMC_2.4G]
C@@H24276

[DW_Guest]
DW##29644
      `
    }
  }
  imgObj = {
    "content": {
        "type": "image",
        "previewImageUrl": "https://chat.daewoong.co.kr/botImgFile/wifi_23_01.png",
        "originalContentUrl": "https://chat.daewoong.co.kr/botImgFile/wifi_23_01.png"
    }
}

  function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
  }

  const Main2 = async function (){
    const fileRes = await fs.readFileSync('../books.txt', { encoding: 'utf8', flag: 'r' });
    baseHeaders.Authorization += JSON.parse(fileRes).access_token;

    for await (let ti of emailArray){

    reqConfig2 = axios.create({
      baseURL: 'https://www.worksapis.com/v1.0/bots/',
      headers: baseHeaders,
      timeout: 3000});

      await reqConfig2.post(`${options.hr_bot}/users/${ti}/messages`,msgObj);
      await reqConfig2.post(`${options.hr_bot}/users/${ti}/messages`,imgObj);
    }
  }

const Main = async function (){


  fs.readFile('../books.txt',(err,data)=>{
    if(err) throw err;
    baseHeaders.Authorization += JSON.parse(data).access_token;
    reqConfig = axios.create({
      baseURL: 'https://www.worksapis.com/v1.0/',
      headers: baseHeaders,
      timeout: 3000});

    //console.log(emailArray.length);
    // modifyBotUser("POST",options.hero_bot,"21342","thlee310@daewoong.co.kr");    // 대화상대 추가 (이메일, options.   _bot 만 변경)
    //sendDirectMsg("대화를 시작해봐요","jwkim023@daewoong.co.kr",1,options.it_bot);    // 대화상대 추가 (이메일, options.   _bot 만 변경)
  
    // get_users_email("whcho@pharmpack.co.kr");
  
    //sendDirectMsg("하하하하","jsjang303@daewoong.co.kr",0);
  
    //sendDirectMsg("하하하하","yjlee230@daewoong.co.kr",0);
    //get_users_email("6210301@daewoong.co.kr");
    //modifyBot("GET",`${options.it_bot}`,{botName:"IT운영팀 챗봇"});
    
    
    // get_users_email("788bc85a-ecaf-4d31-1c03-037779cd927b")
    
    
    //sendDirectMsg("챗봇 서비스를 시작합니다","jwkim023@daewoong.co.kr")
    
    //get_users_email("stevelight88@hanall.co.kr")
    //addBot("GET");

    //리치메뉴 등록 세트
    //modifyBot("GET",`${options.hero_bot}`);
    //addRichMenu("GET",options.hero_bot);
    //modifyRichMenu("DELETE",options.hero_bot,"146909")
    //enrollfileLink(options.hero_bot,"richMenu_prod_005.jpg");
    //addRichMenu("POST",options.hero_bot,"addRichMenu_Post_hero");  //144383
    //uploadfile("richMenu_prod_005.jpg",`http://apis-storage.worksmobile.com/k/emsg/r/kr1/1676246886941162546.1676333286.1.3000497.0.0.0/richMenu_prod_005.jpg`);
    //addRichMenu("GET",options.hero_bot);
    //appendRichMenuImage("POST",options.hero_bot,'823298'); 
    //modifyBot("PATCH",`${options.hero_bot}`,{defaultRichmenuId:"823298"});
    })
}

const sendDirectMsg = async function(msg,userId,isInit,botId){

  reqConfig2 = axios.create({
    baseURL: 'https://www.worksapis.com/v1.0/bots/',
    headers: baseHeaders,
    timeout: 3000});
      apiFunc = await reqConfig2.post(`${botId}/users/${userId}/messages`, (isInit? pay["init_force"]:pay["refresh"]));
  }


let uploadfile = async function(filename,url){

  let options = {
    'method': 'POST',
    'url': url,
    'headers': {
      'Authorization': `${baseHeaders.Authorization}`,
      'Cookie': 'WORKS_RE_LOC=kr1; WORKS_TE_LOC=kr1'
    },
    formData: {
      filename: {
        'value': fs.createReadStream(filename),
        'options': {
          'filename': filename,
          'contentType': null
        }
      }
    }
  };
  
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
  


  }

let enrollfileLink = async function(botId,fn){
  apiFunc = await reqConfig.post(`/bots/${botId}/attachments`, {fileName:fn});
  console.log(apiFunc.data);
};

//POST : 리치메뉴 등록, GET : 리치메뉴 조회
let addRichMenu = async function (rest,botId,postObjName) {
  let apiFunc = {};
  try {
    switch (rest) {
      case "GET":
        apiFunc = await reqConfig.get(`/bots/${botId}/richmenus`, pay.addRichMenu_Get);
        break;
      case "POST":
        apiFunc = await reqConfig.post(`/bots/${botId}/richmenus`, pay[postObjName]);
        break;

      default:
        console.log("REST is not vaild");
        return -1;
    }
    console.log(apiFunc.data);

  } catch (error) {
    console.log(error.response.data);
  }
}



//POST : 리치메뉴 이미지 등록, GET : 리치메뉴 이미지 조회
let appendRichMenuImage = async function (rest, botId, richmenuId){
  let apiFunc = {};
  try {
    switch (rest) {
      case "GET":
        apiFunc = await reqConfig.get(`/bots/${botId}/richmenus/${richmenuId}/image`, pay.appendRichMenuImage_Get);
        break;
      case "POST":
        apiFunc = await reqConfig.post(`/bots/${botId}/richmenus/${richmenuId}/image`, pay.appendRichMenuImage_Post);
        break;
      default:
        console.log("REST is not vaild");
        return -1;
    }
    console.log(apiFunc.data);

  } catch (error) {
    console.log(error.response.data);
  }
}


//GET : 리치메뉴 상세조회, DELETE : 리치메뉴 삭제
let modifyRichMenu = async function (rest,botId,richmenuId) {
  let apiFunc = {};
  try {
    switch (rest) {
      case "GET":
        apiFunc = await reqConfig.get(`/bots/${botId}/richmenus/${richmenuId}`, pay.modifyRichMenu_Get);
        break;
      case "DELETE":
        apiFunc = await reqConfig.delete(`/bots/${botId}/richmenus/${richmenuId}`, pay.modifyRichMenu_Delete);
        break;
      default:
        console.log("REST is not vaild");
        return -1;
    }
    console.log(apiFunc.data);

  } catch (error) {
    console.log(error.response.data);
  }
}

 

//POST : 봇 등록, GET : 봇 조회
let addBot = async function (rest) {
  let apiFunc = {};
  try {
    switch (rest) {
      case "GET":
        apiFunc = await reqConfig.get("/bots", pay.addBot_Get);
        break;
      case "POST":
        apiFunc = await reqConfig.post("/bots", pay.addBot_Post);
        break;

      default:
        console.log("REST is not vaild");
        return -1;
    }
    console.log(apiFunc.data);

  } catch (error) {
    console.log(error.response.data);
  }
}
//GET : 상세정보, PUT : 정보 수정 , PATCH : 부분수정 , DELETE : 봇 삭제
let modifyBot = async function (rest, botId, patchObj) {
  const path = `/bots/${botId}`;
  if (botId && typeof (botId) === 'string' && botId.length === 7) {

  } else {
    console.log("botId is not vaild");
    return -1;
  }
  let apiFunc = {};
  try {
    switch (rest) {
      case "GET":
        apiFunc = await reqConfig.get(path, pay.modifyBot_Get);
        break;
      case "PATCH":
        if (patchObj) {
          apiFunc = await reqConfig.patch(path, patchObj);
        } else {
          console.log("patch object is not vaild");
          return -1;
        }
        break;
      case "PUT":
        apiFunc = await reqConfig.put(path, pay.modifyBot_Patch);
        break;
      case "DELETE":
        apiFunc = await reqConfig.delete(path, pay.modifyBot_Delete);
        break;

      default:
        console.log("REST is not vaild");
        return -1;
    }
    if (apiFunc.data) {
      console.log(apiFunc.data);
    } else {
      console.log(apiFunc);
    }
  } catch (error) {
    console.log(error);
  }
}


// 2. bot 메세지방
//GET : 상세정보, PUT : 정보 수정 , PATCH : 부분수정 , DELETE : 봇 삭제

//POST : 대화방 생성, GET 대화방 멤버 조회, DELETE : 대화방 나가기
let handleChannels = async function (rest, channelObj, botId, chId) {
  const path = `/bots/${botId}/channels`;
  if (botId && typeof (botId) === 'string' && botId.length === 7) {

  } else {
    console.log("botId is not vaild");
    return -1;
  }
  let apiFunc = {};
  try {
    switch (rest) {
      case "POST":
        apiFunc = await reqConfig.post(path, pay.handleChannels_POST);
        break;
      case "GET":
        apiFunc = await reqConfig.patch(path + "/" + `${chId}` + `members`, { "botId": botId, "channelId": chId });
        break;
      case "DELETE":
        apiFunc = await reqConfig.delete(path + `${chId}`, pay.modifyBot_Patch);
        break;
      default:
        console.log("REST is not vaild");
        return -1;
    }
    if (apiFunc.data) {
      console.log(apiFunc.data);
    } else {
      console.log(apiFunc);
    }
  } catch (error) {
    console.log(error);
  }
}

// 8. 구성원 매일 조회 
let get_users_email = async function (userid) {
  try {
    const response = await reqConfig.get(`/users/${userid}`, {
      //  data : payload      
    });
    console.log(response.data);

  } catch (error) {
    console.log(error.response.data);
  }
}
//210997, ac5309e2-7faf-40aa-187b-03761aa46f2c

// 4. 봇 도메인  등록
// POST/bots/{botId}/domains/{domainId}
// GET/bots/{botId}/domains
// PUT/bots/{botId}/domains/{domainId}
// PATCH/bots/{botId}/domains/{domainId}
// DELETE/bots/{botId}/domains/{domainId}
let modifyDomain = async function (rest, botId, domainId) {
  const path = `bots/${botId}/domains`;
  let apiFunc = {};
  try {
    switch (rest) {
      case "POST":
        apiFunc = await reqConfig.post(path + `/${domainId}`, pay.modifyDomain_Post);
        break;
      case "GET":
        apiFunc = await reqConfig.get(path, pay.modifyDomain_Get);
        break;
      case "PUT":
        apiFunc = await reqConfig.put(path + `/${domainId}`, pay.modifyDomain_Put);
        break;
      case "PATCH":
        apiFunc = await reqConfig.patch(path + `/${domainId}`, pay.modifyDomain_Patch);
        break;
      case "DELETE":
        apiFunc = await reqConfig.delete(path + `/${domainId}`, pay.modifyDomain_Delete);
        break;
        default:
        console.log("REST is not vaild");
        return -1;
    }
    if (apiFunc.data) {
      console.log(apiFunc.data);
    } else {
      console.log(apiFunc);
    }
  } catch (error) {
    console.log(error);
  }
}

//5. 사용자 추가 삭제 
// POST/bots/{botId}/domains/{domainId}/members
// GET/bots/{botId}/domains/{domainId}/members
// DELETE/bots/{botId}/domains/{domainId}/members/{userId}
let modifyBotUser = async function (rest, botId, domainId,userId) {
  const path = `bots/${botId}/domains/${domainId}/members`;
  let apiFunc = {};
  try {
    switch (rest) {
      case "POST":
        pay.modifyBotUser_Post.userId=userId;
        apiFunc = await reqConfig.post(path, pay.modifyBotUser_Post);
        break;
      case "GET":
        apiFunc = await reqConfig.get(path, pay.modifyBotUser_Get);
        

        break;
      case "DELETE":
        apiFunc = await reqConfig.delete(path + `/${userId}`, pay.modifyBotUser_Delete);
        break;
        default:
        console.log("REST is not vaild");
        return -1;
    }
    if (apiFunc.data) {
      console.log(apiFunc.data);
    } else {
      console.log(apiFunc);
    }
  } catch (error) {
    console.log(error);
  }
}

//6. 퍼 메뉴 
// POST/bots/{botId}/persistentmenu
// GET/bots/{botId}/persistentmenu
// DELETE/bots/{botId}/persistentmenu

//Main();    
Main();
