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

const forLoop = async (a1, a2, befMsg,aftMsg, recvBody) => {

    if (befMsg) {
        await sendMsgfile({
            method: "POST",
            url: options.url,
            json: {  content: { type: "text", text: befMsg } },
            headers: options.headers
        });
    }

    for (const iter of a2) {
        if (!iter) {
            continue;
        }
        else {
            a1.json.content.previewUrl = iter;
            a1.json.content.resourceUrl = iter;
            a1.json.content.previewImageUrl=iter;
            a1.json.content.originalContentUrl= iter;

            await sendMsgfile(a1);
        }
    }

    
    if (aftMsg) {
        await sendMsgfile({
            method: "POST",
            url: options.url,
            json: { content: { type: "text", text: aftMsg } },
            headers: options.headers
        });
    }

    if(recvBody.content.postback==="c100-70008"){
        await sendMsgfile({
            method: 'POST',
            url: 'https://www.worksapis.com/v1.0/bots/3873810/users/ac5309e2-7faf-40aa-187b-03761aa46f2c/messages',
            headers: {
                consumerKey: '_IkFHBjcR7atGZQERQDZ',
                Authorization: 'Bearer kr1AAABSviAYb+EARx3mo88OuQ134RaxsCov+tYiT976+80Az0eAo5c5nBlmeoDD+g98viVjBhNSBq6wvox1RHdgzQCKzvnEOwfAN6bxkP4+sAq5yMP7/BojyztICEByNL+z8KTi0hbhoRC16qClxqjQXnEOnYJHbI37lMpi5DPy63+I6kVpLPvy5BGB0C/F7uFZs4Tl/7QwXNY/gtAkDNeLzfiI01FYth5F0fhbZ2sLCWNSpBHaI0pIWy+qZ7Y4sAA157HdqzC1KT/jiFddynbnWioaD4/GdfIYG5WOWS89WFl5S4usZrukOiQ/BtjVfN/NF5RSxBc37kr6cUsG5DaoVbtc8PnCoqFQ/wtc+VIgboV0ukXMcgUzpWKVR8Jh/CgMQLVJ9OF8zCldpfMzopOPEZ7LgY8ZjjuzlBMkEKi+OjFcZud48fJ+dxihfrQ4enQqXVdlA==',
                TTL: 2,
                'Content-Type': 'application/json'
              },
            json: {
                "content": {
                    "type": "button_template",
                    "contentText": "test",
                    "actions": [{
                        "type": "message",
                        "label": "가역적/비가역적 저해제란?",
                        "postback": "c100-70010"
                    }]
                }
            }
        });            
    }

};

let sendMsg = function(){

    
}


let responseBotMsg = async function(obj){
    for await (let ti of obj){
        await axios();
    }
};


let sendMsgfile = function (paraOpt) {
    //console.log(JSON.stringify(paraOpt.json));
    return new Promise((resolve, reject) => {

        console.log(paraOpt);
        my_request({
            method: paraOpt.method,
            url: paraOpt.url,
            json: paraOpt.json,
            headers: paraOpt.headers
        }, async function (err, response, body) {
            console.log(body);
            if (err) {
                console.log('========= enter error ========.');
                console.error(err);
                reject();
            } else {
                if (response.statusCode === 200) {
                    console.log("Success(200)")
                    resolve();
                }
                else if (response.statusCode === 500) {
                    console.log("Fail(500)" + JSON.stringify(response));
                    console.log(body);
                    if (response.request.headers.TTL > 0) {
                        console.log(response.request.headers.TTL);
                        paraOpt.headers.TTL = response.request.headers.TTL - 1;
                        try {
                            await sendMsgfile(paraOpt);
                            resolve();
                        } catch (e) {
                            console.log(e)
                            reject();
                        }
                    }
                    else {
                        reject();
                        console.log("TTL is lower than 0");
                    }

                }

                else {
                    console.log("statusCode is undefined");
                    reject();
                }
            }

        }


        )


    }).catch(error => { console.log(error); });

};

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
    //res = await initFunc.getJWT();
    //await fsPromises.writeFile("books.txt", JSON.stringify(res) + `\n`, { encoding: "utf8", flag: "w", mode: 0o666 });

    // 이후 book.txt 리드
    const data1 = await fs.readFileSync('books.txt',{encoding:'utf8', flag:'r'});

    if(data1.hasOwnProperty(data1.access_token)){
        options.headers.Authorization =`Bearer ${res.access_token}`
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

    console.log(`\n== check all input method: ${method}, url :${url} ==`);

    if(isVaildBot(headers["x-works-botid"])){
        next();
    } 
    else {
        console.log("it's not a vaild bot");
        res.status(404).end();
    }
}));

//await new Promise(r => setTimeout(r, 5000 * Math.random()));
app.post("/fexu", wraper(async (req, res, next) => {
    // 로깅 시작
    
    // answerObj = [obj1, obj2, obj3, obj4];
    let answerObj = await vaildateMessage(req);
    let retMsg = await responseBotMsg([1000,2000,3000,4000]);

    // 데이터 전송
    //postback으로 받는 데이터로 여러 입력을 처리할 수있어야됨
        
  }));


app.get("/botImgFile/*", function (req, res) {
    console.log("botImgfile")
    const { headers, method, url } = req;
    console.log("haha");
    console.log(url);
    res.sendFile(path.join(__dirname, url.replace(";", "")));
});


const vaildateMessage =  function (req) {    
    return new Promise((resolve, reject) => {
            console.log(req.body);
            console.log(req.headers);
            resolve();
    }).catch(error => { 
        console.log(error); 
    });


}


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
