const fs = require("fs");
const fsPromises = fs.promises;
const axios = require("axios");
const qs = require("qs");
const jwt = require('jsonwebtoken');
const path = require("path")
const my_request = require("request")


const http = require('http')
const https = require('https')

const express = require("express")
const bodyParser = require("body-parser")
let options = require("./options.js")
const initFunc = require("./axios_post.js")
const dbconn = require("./db-conn.js")
const lklist = require("./ln-list.js");
const { wrap } = require("module");
const { Console } = require("console");

const app = express()

let baseHeaders={
    'Authorization': "Bearer ",
      "Content-Type": `application/json`
  };




let masterData = {
    chatBotList: [],
    contentList: [],
    actionList: [],
    textList: [],
    saleList: []
};

let botInstList = [];
let contentInstList = [];
let actionInstList = [];
let textInstList = [];
let saleInstList = [];

let makeAnswerJson = function(botId,reqbody,contObj){

    if(!contObj){
        return 0;
    }

    console.log("===reqbody");
    console.log(reqbody);
    console.log("===contObj");
    console.log(contObj);

let retObj = {
    botId : botId,
    userId : reqbody.source.userId,

    json:{
        content: {
          }
        }
    }

    switch (contObj.contType){
        case "text":
            break;
        case "image":
            retObj.json.content.type = contObj.contType;
            retObj.json.content.previewImageUrl = contObj.contPreImg;
            retObj.json.content.originalContentUrl = contObj.contOrgImg;
            return retObj;
            break;

        case "button_template":
            retObj.json.content.type = contObj.contType;
            retObj.json.content.contentText = contObj.contText;
            retObj.json.content.actions= [];
            for( let qi of contObj.contActionSet){
                retObj.json.content.actions.push({
                    type:qi.actType,
                    label:qi.actName,
                    postback:qi.nextContCode
                })
            }
            return retObj;
            break;

            default:
                return {};
    }
};


let responseBotMsg = async function(obj){
    let reqConfig = axios.create({
        baseURL: `https://www.worksapis.com/v1.0/bots/`,
        headers: baseHeaders,
        timeout: 3000});
    //test

    for await (let ti of obj){
        if(ti===0){continue};
        let startTime = 0;
        let endTime = 0;
        
        startTime = new Date().getTime();
        apiFunc = await reqConfig.post(`${ti.botId}/users/${ti.userId}/messages`, ti.json);
        endTime = new Date().getTime();
        console.log(endTime-startTime);
        await new Promise(resolve => setTimeout(resolve,900-(endTime-startTime)));
    }
};

const vaildateMessage =  function (req) {    
    return new Promise((resolve, reject) => {
        retArray = []
        const { headers, body } = req;
        console.log(body);
        //다음 지시자 있는 경우 
        if(body.content.postback){ 
            let pbCountList = req.body.content.postback.split(",");
                for(let xi of pbCountList){
                    retArray.push(
                    makeAnswerJson(headers["x-works-botid"],body,findCurrCont(xi,contentInstList))
                    )
                }
                resolve(retArray)
                // 컨텐츠 갯수 검사 
                //Ident 검사
                // 컨텐츠 전송 ( 간격 조정)
        } 
        //단순 텍스트 입력인 경우 
        else if(body.content.type==="text") {

            let botInst = isVaildBot(headers["x-works-botid"]);
            if(botInst){
                for (let ti of botInst.botRevTxtList)
                    if(ti.TXT_INP_TXT===body.content.text){
                        let txtpbCountList = ti.TXT_CONT_CD.split(",");
                        for(let zi of txtpbCountList){
                            retArray.push(
                                makeAnswerJson(headers["x-works-botid"],body,findCurrCont(zi,contentInstList))
                                );
                            }
                        resolve(retArray)
                }
            }
            // # 검색 확인

            
            // 아닐경우 (자연어)


            // 디폴트 

            
        }

    }).catch(error => { 
        console.log(error); 
    });
}


let isVaildBot = function (worksBotNo) {
    //global scope : botInstList
    for (bi of botInstList) {
        if (bi.botWorksCode === worksBotNo) {
            return bi;
        }
    }
    console.log("error : bot number is not exist");
    return 0;
};

let findCurrCont = function (postback, conList) {
    x = undefined;
    x = conList.find(o => o.contCode === postback);

    if (x == undefined) {
        return undefined;
    } else {
        return x;
    }
};

let hashSearch = function (inputText, botCode) {
    console.log(inputText);
    let arrayCount = 0;
    let outArray = [];

    for (let hs of masterData.contentList) {
        if (hs.CONT_BOT_CD === botCode) {
            if (hs.CONT_KWD && hs.CONT_KWD.indexOf(inputText) != -1) {
                if (arrayCount >= 10) {
                    break;
                }

                arrayCount++;
                outArray.push(
                    {
                        "title": hs.CONT_TXT,
                        "text": hs.CONT_TXT,
                        "defaultAction": {
                            "type": "postback",
                            "label": "자세히 보기",
                            "data": hs.CONT_CD
                        },
                        "actions": [{
                            "type": "postback",
                            "label": "자세히 보기",
                            "data": hs.CONT_CD
                        }]
                    }
                )
            }
        }
    }

    return outArray;

};

let createlogfile = function () {
    let yourDate = new Date()
    return yourDate.toISOString().split('T')[0]
};

let logStream = function (value) {

    mystring = path.join(__dirname, "log", `${createlogfile()}.txt`);
    if (fs.existsSync(mystring)) {
        var logStream = fs.createWriteStream(mystring, { flags: 'a' });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        logStream.write(JSON.stringify(value));
        logStream.end("\n");
    }
    else {
        var logStream = fs.createWriteStream(mystring, { flags: 'w' });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        logStream.write(JSON.stringify(value));
        logStream.end("\n");
    }

};


let makeActionJson = function (actionSetData) {
    let retArray = [];
    for (let i of actionSetData) {
        let actions = {
            type: i.actType,
            label: i.actName,
            postback: i.nextContCode
        };
        retArray.push(actions);
    }
    return retArray;
};

let readObjectinfo = function (readObject) {

    //date
    dataToSend = ""
    var bash = spawn('sh', ['upload_object.sh']);
    bash.stdout.on('data', function (data) {
        console.log("Pipe data from bash script");
        dataToSend = data.toString();
        console.log(dataToSend);
    });
    //write
    bash.on('close', (code) => {
        console.log(code);
        var d = new Date();
        let curtime = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2)
        console.log(curtime);

        fs.readFile('pdf_url', (err, data) => {
            if (err) throw err;
            console.log(data.toString());

            if (data.toString().match("x-works-resource-id")) {
            }
        });
    });
}


const initialize = async function () {
    let res = {};
    // 하루 1회 리딩
    res = await initFunc.getJWT();
    res.tokenTime = new Date();
    await fsPromises.writeFile("books.txt", JSON.stringify(res) + `\n`, { encoding: "utf8", flag: "w", mode: 0o666 });
    // 이후 book.txt 리드
    const fileRes = await fs.readFileSync('books.txt',{encoding:'utf8', flag:'r'});
    const axOptions = JSON.parse(fileRes);

    if(axOptions.access_token){
        baseHeaders.Authorization +=axOptions.access_token
        console.log(baseHeaders);
    }
    
    dbconn.readMasterTable(options.dbpool).then(function (data) {
        masterData.chatBotList = data[0].slice(0, data[0].length);
        masterData.contentList = data[1].slice(0, data[1].length);
        masterData.actionList = data[2].slice(0, data[2].length);
        masterData.textList = data[3].slice(0, data[3].length);
        masterData.saleList = data[4].slice(0, data[4].lenth);

        console.log("0.====read pdf object info ==== ");
        //    readObjectinfo('a');


        console.log("1.====init ActionNode config ==== ");
        for (let i of masterData.actionList) {
            actionInstList.push(new lklist.ActNode(i));
        }

        console.log("2.====init ContNode config ==== ");
        for (let t = 0; t < masterData.contentList.length; t++) {
            contentInstList[t] = new lklist.ContNode(masterData.contentList[t]);
            contentInstList[t].appendActionSet(actionInstList);
        }

        console.log("3.====init reserved Text config ==== ");
        textInstList = masterData.textList;
        console.log(textInstList);
        console.log("4.====init BotNode config ==== ");
        for (let j = 0; j < masterData.chatBotList.length; j++) {
            botInstList[j] = new lklist.BotNode(masterData.chatBotList[j]);

            botInstList[j].appendEntryPoint(contentInstList);
            botInstList[j].appendReservedText(textInstList);
        }

        console.log("5.====init Action NextNode config ==== ");
        for (let ai of actionInstList) {
            ai.appendNextCont(contentInstList);
        }
        console.log("6.====init Sales Member config ==== ");
        saleInstList = masterData.saleList;
        console.log(saleInstList);

        console.log("7.====activate server config ==== ");
        console.log('server has started.');
    });
}

const wraper = asyncFn => {
    // FIXME: Promise와 catch를 이용하면 더 간결해질 것 같습니다.
      return (async (req, res, next) => {
        try {
          return await asyncFn(req, res, next)
        } catch (error) {
          return next(error)
        }
      })  
    }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', function (req, res, next) {
    const { headers, method, url } = req;
    console.log(`\n== check all input method: ${method}, url :${url} ==`);
    next();
});


//post 요청사항 사전검사{봇 존재 여부, 봇 코드 존재여부}
app.post("*", wraper(async (req, res, next) => {
    const { headers, method, url } = req;
    //    console.log(Object.keys(req));
    console.log(`\n== check post method: ${method}, url :${url} ==`);
    if(isVaildBot(headers["x-works-botid"])){
        next();
    } 
    else {
        console.log("it's not a vaild bot");
        //필요하다면 meesage Text 로 현재 응답할 수 있는 상태가 아니다
        res.status(404).end();
    }
}));


//await new Promise(r => setTimeout(r, 5000 * Math.random()));
app.post("/fexu", wraper(async (req, res, next) => {
    // 로깅 시작
    // answerObj = [obj1, obj2, obj3, obj4];
    let answerObj = await vaildateMessage(req);
    console.log("=====answerobj : ");
    console.log(answerObj);
    let retMsg = await responseBotMsg(answerObj);
    // 데이터 전송
    //postback으로 받는 데이터로 여러 입력을 처리할 수있어야됨
        
  }));


app.get("/botImgFile/*", function (req, res) {

    try{
    console.log("botImgfile")
    const { headers, method, url } = req;
    console.log("haha");
    console.log(url);
    res.sendFile(path.join(__dirname, url.replace(";", "")));
    } catch(err){
        console.log("img get error");
    }
});



    // 1.입력 데이터에 대한 로깅 
        // (1)"안녕" 이라고 텍스트 입력
        // (2)"#입력값" 이라고 검색 텍스트 입력 
        // (3) 리치메뉴를 통한 입력
        // (4) 버튼 템플릿으로 postback을 받은 경우
        // (5) 

    // 응답 데이터 작성 부 

app.post("/test", function (req, res) {
    //    console.log(Object.keys(req));
    console.log(req.body);
    res.end()
});

initialize().then(()=>{
    https.createServer(options, app).listen(80);
    https.createServer(options, app).listen(443);
}
)
