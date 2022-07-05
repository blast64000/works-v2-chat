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
const lklist = require("./ln-list.js")

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

let fundBotNumber = function (worksBotNo) {
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
    let res = await initFunc.getJWT();
    options.headers.Authorization =`Bearer ${res.access_token}`
    console.log(JSON.stringify(res));
    await fsPromises.writeFile("books.txt", JSON.stringify(res) + `\n`, { encoding: "utf8", flag: "w", mode: 0o666 });

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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', function (req, res, next) {
    const { headers, method, url } = req;
    console.log(`\n== check all input method: ${method}, url :${url} ==`);
    next();
});

app.get("/botImgFile/*", function (req, res) {
    console.log("botImgfile")
    const { headers, method, url } = req;
    console.log("haha");
    console.log(url);
    res.sendFile(path.join(__dirname, url.replace(";", "")));
});


app.post("/fexu", function (req, res) {
    const { headers, method, url } = req;
    options.url = `https://www.worksapis.com/v1.0/bots/${options.botNo}/users/${req.body.source.userId}/messages`
    options.headers.TTL = 2;
    let body = [];
    let reqBody = { accountId: "", content: {} };

    options.headers["Content-Type"] = "application/json"
    let recvBody = req.body;

    reqBody.accountId = recvBody.source.accountId;
    console.log("==recived body");
    console.log(recvBody);
    console.log(headers);
    if (recvBody.content == undefined && recvBody.type === "postback") {
        recvBody.content = {};
        recvBody.content.type = "text";
        recvBody.content.text = recvBody.data;
        recvBody.content.postback = recvBody.data;
    }
    recvBody.recvType = undefined;

    if (recvBody.content.type === "text") {
        console.log("it's text")
        let myBotNode = fundBotNumber(headers['x-works-botid']);
        //
        if (myBotNode) {
            if (!recvBody.content.postback) {
                if (!recvBody.recvType) {
                    recvBody.recvType = "User_txt_input";
                }
                // #search
                if (recvBody.content.text.charCodeAt(0) === 35) {
                    reqBody.content.type = "carousel";
                    temp1 = hashSearch(recvBody.content.text.slice(1).toUpperCase(), myBotNode.botCode);
                    if (temp1.length == 0) {
                        reqBody.content.type = "text";
                        reqBody.content.text = "검색결과가 없습니다.";
                        recvBody.recvType = "Text_return";
                    } else {
                        reqBody.content.columns = temp1;
                    }

                }
                // TextList 순회 
                else {
                    let textListFlag = 0;
                    for (let ti of myBotNode.botRevTxtList) {

                        if (recvBody.content.text === ti.TXT_INP_TXT) {

                            //지정 Cont 리턴
                            if (ti.IS_ENTRY) {
                                let reqContent = findCurrCont(ti.TXT_CONT_CD, contentInstList);
                                reqBody.content.type = reqContent.contType;

                                if (reqContent.contType === "image") {

                                    reqBody.content.previewUrl = reqContent.contPreImg;
                                    reqBody.content.resourceUrl = reqContent.contOrgImg;

                                    reqBody.content.previewImageUrl=reqContent.contPreImg;
                                    reqBody.content.originalContentUrl= reqContent.contPreImg;

                                    reqBody.content.aftMsg = reqContent.contAftMsg;
                                    recvBody.recvType = "BT_return";
                                    textListFlag++;
                                    break;
                                }
                                else if (reqContent.contType === "button_template") {
                                    //content type 이 button Template
                                    reqBody.content.contentText = reqContent.contText;
                                    reqBody.content.actions = makeActionJson(reqContent.contActionSet);
                                    recvBody.recvType = "Img_return";
                                    textListFlag++;
                                    break;
                                }
                            }

                            // 일반 텍스트 리턴
                            else {
                                textListFlag++;
                                reqBody.content.type = "text";
                                reqBody.content.text = ti.TXT_OUT_TXT;
                                recvBody.recvType = "Text_return";

                                break;
                            }
                        }
                    }

                    if (textListFlag === 0) {
                        let reqContent = findCurrCont(myBotNode.botStartNode.contCode, contentInstList);
                        reqBody.content.type = reqContent.contType
                        reqBody.content.contentText = reqContent.contText;
                        reqBody.content.actions = makeActionJson(reqContent.contActionSet);
                        recvBody.recvType = "Img_return";

                    }
                }


            }
            //postback 있음
            else {
                let reqContent = findCurrCont(recvBody.content.postback, contentInstList);

                if (!reqContent) {
                    //오류 사항  CurrentCont  가 없을때 (시작하기 누를때)                            
                }

                else if (reqContent.contType === "image") {
                    console.log(reqContent.contPreImg);
                    reqBody.content.type = reqContent.contType;
                    reqBody.content.previewUrl = reqContent.contPreImg;
                    reqBody.content.resourceUrl = reqContent.contOrgImg;

                    reqBody.content.previewImageUrl=reqContent.contPreImg;
                    reqBody.content.originalContentUrl= reqContent.contPreImg;

                    reqBody.content.aftMsg = reqContent.contAftMsg;
                    reqBody.content.befMsg = reqContent.contBefMsg;

                    recvBody.recvType = "Post_img";

                }
                else if (reqContent.contType === "button_template") {
                    //content type 이 button Template

                    reqBody.content.type = reqContent.contType;
                    reqBody.content.contentText = reqContent.contText;
                    reqBody.content.actions = makeActionJson(reqContent.contActionSet);
                    recvBody.recvType = "Post_BT";
                }

                else if (reqContent.contType === "file") {

                    console.log(reqContent.contImgId);

                    if (reqContent.contImgId) {
                        reqBody.content.type = reqContent.contType;
                        reqBody.content.resourceId = reqContent.contImgId;

                    } else {
                        reqBody.content.type = reqContent.contType;
                        reqBody.content.resourceUrl = reqContent.contPreImg;
                    }
                    recvBody.recvType = "Post_file"
                }

                else if (reqContent.contType === "text") {
                    console.log(reqContent);
                    reqBody.content.type = "text";
                    reqBody.content.text = reqContent.contText;
                    recvBody.recvType = "Text_return";
                }
                else if (reqContent.contType === "db_access") {
                    let TFcounter = false;
                    for (let sel of saleInstList) {
                        if (recvBody.source.accountId === sel.SALE_EMAIL) {
                            reqBody.content.type = "text";
                            reqBody.content.text = `기준점 : ${sel.SALE_GROUND} \n 최종실적 : ${sel.SALE_FINAL} \n 성장금액 : ${sel.SALE_UP_AMT} \n 성장률 : ${sel.SALE_UP_PER} `
                            recvBody.recvType = "Text_return";
                            TFcounter = true;
                        }
                    }

                    if (!TFcounter) {
                        reqBody.content.type = "text";
                        reqBody.content.text = `정의된 실적이 없습니다`
                        recvBody.recvType = "Text_return";
                    }
                }

                else {


                }
            }

        }
        else {
            console.log("bot is not exist");
        }
    }
    //else if(recvBody.content.type==="image"){}
    //else if(recvBody.content.type==="link") {}
    //else if(recvBody.content.type==="sticker") {}            
    //else if(recvBody.content.type==="file") {}
    else {

    }

    paraOpt = {
        method: "POST",
        url: options.url,
        json: reqBody,
        headers: options.headers
    }



    // 그림 여려개 예외처리 
    if (reqBody.content.type === "image") {

        if (!paraOpt.json.content.previewUrl) {
            console.log("image url is null");
            paraOpt.json.content.type = "text";
            paraOpt.json.content.text = "등록 이미지 없음";
            sendMsgfile(paraOpt);
        }

        else {
            imgList = reqBody.content.previewUrl.split(";");
            console.log("이미지 리스트");
            console.log(imgList);
            forLoop(paraOpt, imgList,reqBody.content.befMsg,reqBody.content.aftMsg, recvBody);
        }



        /*
        paraOpt.json.content.type = 'button_template';
        paraOpt.json.content.contentText = reqContent.contText;
        paraOpt.json.content.actions = makeActionJson(reqContent.contActionSet);
        sendMsgfile(paraOpt);
        hi
        */

    }
    else {
        sendMsgfile(paraOpt);
    }

});
app.post("/test", function (req, res) {
    //    console.log(Object.keys(req));
    console.log(req.body);
    res.end()
});

initialize();
https.createServer(options, app).listen(80);
https.createServer(options, app).listen(443);