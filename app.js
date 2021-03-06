const fs = require("fs");
const fsPromises = fs.promises;
const axios = require("axios");
const path = require("path")

const http = require('http')
const https = require('https')

const converter = require('json-2-csv');
const express = require("express")
const bodyParser = require("body-parser")
let options = require("./options.js")
const initFunc = require("./axios_post.js")
const dbconn = require("./db-conn.js")
const lklist = require("./ln-list.js");
const { type } = require("os");
const { text } = require("express");

const app = express()

let baseHeaders = {
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


let makeAnswerJson = function (botId, reqbody, contObj) {
    if (!contObj) {
        return 0;
    }

    let retObj = {
        botId: botId,
        userId: reqbody.source.userId,

        json: {
            content: {
            }
        }
    }

    switch (contObj.contType) {
        case "text":
            if (contObj.contText === "") { return 0 };
            retObj.json.content.type = contObj.contType;
            retObj.json.content.text = contObj.contText;
            return retObj;
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
            retObj.json.content.actions = [];
            for (let qi of contObj.contActionSet) {
                retObj.json.content.actions.push({
                    type: qi.actType,
                    label: qi.actName,
                    postback: qi.nextContCode
                })
            }
            return retObj;
            break;

        case "carousel":
            console.log(contObj);
            if (!contObj.outArray) { return 0 };
            retObj.json.content.type = contObj.contType;
            retObj.json.content.columns = contObj.outArray;
            return retObj;
            break;

        default:
            return {};
    }
};

let responseBotMsg = async function (obj) {
    let reqConfig = axios.create({
        baseURL: `https://www.worksapis.com/v1.0/bots/`,
        headers: baseHeaders,
        timeout: 3000
    });
    //test

    for await (let ti of obj) {
        if (ti === 0) { continue };
        let startTime = 0;
        let endTime = 0;

        startTime = new Date().getTime();
        apiFunc = await reqConfig.post(`${ti.botId}/users/${ti.userId}/messages`, ti.json);
        endTime = new Date().getTime();
        console.log(endTime - startTime);
        await new Promise(resolve => setTimeout(resolve,
            (endTime - startTime) > 0 ? (1000 - (endTime - startTime)) : 10));
    }
};

const vaildateMessage = function (req) {
    return new Promise((resolve, reject) => {
        retArray = []
        const { headers, body } = req;
        switch (body.type) {
            case "message":
                if (body.content.postback) {
                    if (body.content.postback === "start") { body.content.postback = "C00-F10000"; }
                    let pbCountList = body.content.postback.split(",");
                    for (let xi of pbCountList) {
                        retArray.push(
                            makeAnswerJson(headers["x-works-botid"], body, findCurrCont(xi.trim(), contentInstList))
                        )
                    }
                    resolve(retArray)
                    // ????????? ?????? ?????? 
                    //Ident ??????
                    // ????????? ?????? ( ?????? ??????)
                }
                //?????? ????????? ????????? ?????? 
                else if (body.content.type === "text") {
                    let botInst = isVaildBot(headers["x-works-botid"]);
                    if (botInst) {
                        if (body.content.text.charCodeAt(0) === 35) {
                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, hashSearch(body.content.text.slice(1).toUpperCase())))
                            resolve(retArray)
                        }

                        else {
                            for (let ti of botInst.botRevTxtList) {
                                if (ti.TXT_INP_TXT === body.content.text) {
                                    let txtpbCountList = ti.TXT_CONT_CD.split(",");
                                    for (let zi of txtpbCountList) {
                                        retArray.push(
                                            makeAnswerJson(headers["x-works-botid"], body, findCurrCont(zi, contentInstList))
                                        );
                                    }
                                    resolve(retArray)
                                }


                            }

                            if(retArray.length===0){
                                if(body.content.text==="?????? ????????????"){break;}
                                if(body.content.text==="?????? ??????"){break;}
                            retArray.push(makeAnswerJson(headers["x-works-botid"], body,{contType:"text",contText:"????????? ?????? ????????? ???????????? #??? ??????????????? (ex> #??????) \n ?????????????????? ???????????????."} ))
                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, findCurrCont("C00-F10000", contentInstList)))
                            resolve(retArray);
                            }
                        }



                    }
                    // ????????? 


                }
                break;
            case "postback":
                let pbCountList = body.data.split(",");
                console.log(pbCountList);
                for (let xi of pbCountList) {
                    retArray.push(
                        makeAnswerJson(headers["x-works-botid"], body, findCurrCont(xi.trim(), contentInstList))
                    )
                }
                resolve(retArray)

                break;

            default:
                resolve([0]);
                break;
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

let hashSearch = function (inputText) {
    let arrayCount = 0;
    let retobj = {
        contType: "carousel",
        outArray: []
    }

    for (let hs of actionInstList) {
        if (hs.actkeyWord && (hs.actSetCode.slice(0, 3) === "S00") && hs.actkeyWord.indexOf(inputText) != -1) {
            if (arrayCount >= 10) {
                break;
            }
            arrayCount++;
            retobj.outArray.push(
                {
                    "title": hs.actName,
                    "text": hs.actName,
                    "defaultAction": {
                        "type": "postback",
                        "label": "????????? ??????",
                        "data": hs.nextContCode
                    },
                    "actions": [{
                        "type": "postback",
                        "label": "????????? ??????",
                        "data": hs.nextContCode
                    }]
                }
            )
        }
    }

    if (arrayCount === 0) {
        retobj = {
            contType: "text",
            contText: "??????????????? ????????????"
        };
    }
    return retobj;

};

let json2Text = function(headers,body){

    return new Promise((resolve, reject) => {
    let retString = "";
    if(headers["x-works-botid"]){
        retString+=`${headers["x-works-botid"]}, `;
    }

    if(body.type){
        let newDate = new Date(body.issuedTime);
        newDate.setHours(newDate.getHours()+9);
        retString+=`${newDate.toISOString()}, ${body.type}, `
    }  

    if(body.source){
        retString+=`${body.source.userId}, ${body.source.domainId}, `
    }

    if(body.content){
        retString+=`${body.content.type}, ${body.content.text}, `

        if(body.content.postback){
            retString+=`${body.content.postback}`
        } else { 
            retString+=` `
        }


    }else{
        retString+=` , , `
    }



    if(retString===""){
        reject("");
    }else { 
        console.log(retString);
        resolve(retString);
    }

});
}

let makeLogName = function () {
    let yourDate = new Date()
    yourDate.setHours(yourDate.getHours()+9);
    return yourDate.toISOString().split('T')[0]
};

let log2csv = function (inpString) {

    mystring = path.join(__dirname, "log", `${makeLogName()}.csv`);

    if (fs.existsSync(mystring)) {
        let logStream = fs.createWriteStream(mystring, { flags: 'a', encoding: 'utf-8' });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        logStream.write(inpString);
        logStream.end("\n");
    }
    else {
        let header = "botId, time, msgtype, userId, domainId, contType, text, postback";
        let logStream = fs.createWriteStream(mystring, { flags: 'w' });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        logStream.write(`\ufeff${header}\n${inpString}`);
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


const initialize = async function () {
    let res = {};
    // ?????? 1??? ??????
    res = await initFunc.getJWT();
    res.tokenTime = new Date();
    await fsPromises.writeFile("books.txt", JSON.stringify(res) + `\n`, { encoding: "utf8", flag: "w", mode: 0o666 });
    // ?????? book.txt ??????
    const fileRes = await fs.readFileSync('books.txt', { encoding: 'utf8', flag: 'r' });
    const axOptions = JSON.parse(fileRes);

    if (axOptions.access_token) {
        baseHeaders.Authorization += axOptions.access_token
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
    // FIXME: Promise??? catch??? ???????????? ??? ???????????? ??? ????????????.
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

//post ???????????? ????????????{??? ?????? ??????, ??? ?????? ????????????}
app.post("*", wraper(async (req, res, next) => {
    const { headers, method, url } = req;
    //    console.log(Object.keys(req));
    console.log(`\n== check post method: ${method}, url :${url} ==`);
    if (isVaildBot(headers["x-works-botid"])) {
        next();
    }
    else {
        console.log("it's not a vaild bot");
        //??????????????? meesage Text ??? ?????? ????????? ??? ?????? ????????? ?????????
        res.status(404).end();
    }
}));

app.post("/fexu", wraper(async (req, res, next) => {

    const { headers, body } = req;
    console.log(headers);
    console.log(body);

    let answerObj = await vaildateMessage(req);
    console.log("=====answerobj : ");
    console.log(answerObj);
    let retMsg = await responseBotMsg(answerObj);

    logreturn = await json2Text(headers,body);
    if(logreturn){
        log2csv(logreturn);
    }

    // ????????? ??????
    //postback?????? ?????? ???????????? ?????? ????????? ????????? ???????????????

}));

app.get("/botImgFile/*", function (req, res) {

    try {
        console.log("botImgfile")
        const { headers, method, url } = req;
        console.log("haha");
        console.log(url);
        res.sendFile(path.join(__dirname, url.replace(";", "")));
    } catch (err) {
        console.log("img get error");
    }
});

// 1.?????? ???????????? ?????? ?????? 
// (1)"??????" ????????? ????????? ??????
// (2)"#?????????" ????????? ?????? ????????? ?????? 
// (3) ??????????????? ?????? ??????
// (4) ?????? ??????????????? postback??? ?????? ??????
// (5) 

// ?????? ????????? ?????? ??? 

app.post("/test", function (req, res) {
    //    console.log(Object.keys(req));
    console.log(req.body);
    res.end()
});

initialize().then(() => {
    http.createServer(options, app).listen(80);
    https.createServer(options, app).listen(443);
}
)
