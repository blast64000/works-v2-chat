const fs = require("fs");
const fsPromises = fs.promises;
const axios = require("axios");
const path = require("path");
const { exit } = require("process");
const options = require("../options.js");
const request = require('request');
const { Configuration, OpenAIApi } = require("openai");
/*구글시트 API*/
//const { GoogleSpreadsheet } = require("google-spreadsheet");
//const creds = require("./nabota-v-olet-chat-de1200fdd4b4.json"); // 키 생성 후 다운된 json파일을 지정합니다.
//const doc = new GoogleSpreadsheet('1LyaKIhK7Fb6FkWxYAIeZ7r9dRIoco3vAQ3JJjKSLJt8');



let isVaildBot = function (worksBotNo, botInstList) {
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

let makeAnswerJson = function (worksBotId, reqbody, contObj) {

    if (!contObj) { return 0 }


    let retObj = {
        botId: worksBotId,
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

        case "file":
            retObj.json.content.type = contObj.contType;
            retObj.json.content.originalContentUrl = contObj.contPreImg;
            return retObj;
            break;

        case "carousel":
            if (!contObj.outArray) { return 0 };
            retObj.json.content.type = contObj.contType;
            retObj.json.content.columns = contObj.outArray;
            return retObj;
            break;


        default:
            return {};
    }
};

let hashSearch = function (inputText, actionInstList, botInst) {
    let arrayCount = 0;
    let retobj = {
        contType: "carousel",
        outArray: []
    }
    console.log(botInst.botStartNode.contActSetCode.slice(0, 5));
    for (let hs of actionInstList) {
        if (hs.actkeyWord && (hs.actSetCode.slice(0, 5) === botInst.botStartNode.contActSetCode.slice(0, 5)) && hs.actkeyWord.replace(/ /g, '').indexOf(inputText) != -1) {
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
                        "label": "자세히 보기",
                        "data": hs.nextContCode
                    },
                    "actions": [{
                        "type": "postback",
                        "label": "자세히 보기",
                        "data": hs.nextContCode
                    }]
                }
            )
        }
    }

    if (arrayCount === 0) {
        retobj = {
            contType: "text",
            contText: "검색결과가 없습니다"
        };
    }
    return retobj;

};

const vaildateMessage = function (req, contentInstList, botInstList, actionInstList) {
    return new Promise((resolve, reject) => {

        retArray = []
        let dbBotId = "";
        const { headers, body } = req;

        let botInst = isVaildBot(headers["x-works-botid"], botInstList);
        if (botInst === 0) {
            reject()
        } else {
            dbBotId = botInst.botCode;
        }

        switch (body.type) {
            case "message":
                if (body.content.postback) {
                    if (body.content.postback === "start") { body.content.postback = botInst.botStartCode; }
                    let pbCountList = body.content.postback.split(",");
                    for (let xi of pbCountList) {
                        retArray.push(
                            makeAnswerJson(headers["x-works-botid"], body, findCurrCont(xi.trim(), contentInstList))
                        )
                    }
                    resolve(retArray)
                }

                else {
                    for (let ti of botInst.botRevTxtList) {
                        if (ti.TXT_INP_TXT === body.content.text) {
                            if (ti.TXT_CONT_CD) {
                                let txtpbCountList = ti.TXT_CONT_CD.split(",");
                                for (let zi of txtpbCountList) {
                                    retArray.push(
                                        makeAnswerJson(headers["x-works-botid"], body, findCurrCont(zi, contentInstList))
                                    );
                                }
                                resolve(retArray)
                            } else {
                                //★ 메세지 전송 필요 
                                resolve(retArray)
                            }
                        }
                    }

                    if (retArray.length === 0) {
                        retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "text", contText: "필요한 내용 검색을 위해서는 #을 붙여주세요 (ex> #핼프) \n 메인화면으로 돌아갑니다." }))
                        retArray.push(makeAnswerJson(headers["x-works-botid"], body, findCurrCont(botInst.botStartCode, contentInstList)))
                        resolve(retArray);
                    }
                }

                //단순 텍스트 입력 --> NLP 모델 적용

                
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
            case "inbound":
                resolve([
                    {
                        botId: options.test_bot,
                        userId: "jwkim023@daewoong.co.kr",
                        isInbound: true,
                        json: {
                            content: {
                                type: 'text',
                                text: 'it.js:229'
                            }
                        }
                    },
                    {
                        botId: options.test_bot,
                        userId: "pys1210@daewoong.co.kr",
                        isInbound: true,
                        json: {
                            content: {
                                type: 'text',
                                text: `err can't read google drive`
                            }
                        }
                    }
                ])

            default:
                resolve([0]);
                break;
        }

    }).catch(error => {
        console.log(error);
    });
}

let responseBotMsg = async function (objArray, baseHeaders) {
    console.log(objArray);
    const DAVINCI_TOKEN_MAX_LENGTH = 2048;

    let reqConfig = axios.create({
        baseURL: `https://www.worksapis.com/v1.0/bots/`,
        headers: baseHeaders,
        timeout: 3000
    });
    //test

    for await (let ti of objArray) {
        try {
            console.log(ti);
            if (ti === 0) { continue }
            else if (ti.isNLP) {
                const configuration = new Configuration({
                    apiKey: options.open_api_key_daba,
                });

                const openai = new OpenAIApi(configuration);

                console.log(ti.json.content.text);
                console.log(ti.json.content.text.split(" ").filter(x => x != ""));
                console.log(ti.json.content.text.split(" ").filter(x => x != "").length);

                const response = await openai.createChatCompletion({
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        { "role": "user", "content": ti.json.content.text }
                    ],
                    "temperature": 1,
                    "top_p": 1,
                    "n": 1,
                    "stream": false
                });

                let originString = ti.json.content.text;
                let tempString1 = "";

                console.log(response.data);
                console.log(response.data.choices);
                
                ti.json.content.text=""
                for await (let ti of response.data.choices[0].message.content.split(",")){
                    tempString1+=`${originString}\t${ti}\n`
                }
                ti.json.content.text = tempString1;

            }

            let startTime = 0;
            let endTime = 0;

            startTime = new Date().getTime();
            apiFunc = await reqConfig.post(`${ti.botId}/users/${ti.userId}/messages`, ti.json);
            endTime = new Date().getTime();
            console.log(endTime - startTime);
            await new Promise(resolve => setTimeout(resolve,
                (endTime - startTime) > 0 ? (1000 - (endTime - startTime)) : 10));
        } catch (err) {
            console.log("error:");
            console.log(err);
        }
    }
};


let makeLogName = function () {
    let yourDate = new Date()
    yourDate.setHours(yourDate.getHours() + 9);
    return yourDate.toISOString().split('T')[0]
};

//concept : json 으로 작성하고 key repalce 후 csv 형식으로 작성하는것으로 변경 
const writeJson = function (headers, body) {
}


let json2Text = function (headers, body) {
    return new Promise((resolve, reject) => {
        let retString = "";
        if (headers["x-works-botid"]) {
            retString += `${headers["x-works-botid"]}, `;
        }

        if (body.type) {
            let newDate = new Date(body.issuedTime);
            newDate.setHours(newDate.getHours() + 9);
            retString += `${newDate.toISOString()}, ${body.type}, `
        }

        if (body.source) {
            retString += `${body.source.userId}, ${body.source.domainId}, `
        }

        if (body.content) {
            retString += `${body.content.type}, ${body.content.text}, `

            if (body.content.postback) {
                retString += `${body.content.postback}`
            } else {
                retString += ` `
            }


        } else {
            retString += ` , , `
        }



        if (retString === "") {
            reject("");
        } else {
            resolve(retString);
        }

    });
}

let log2csv = function (inpString, dirName) {

    mystring = path.join(dirName, "log", `${makeLogName()}.csv`);

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


const hn = { vaildateMessage, responseBotMsg, json2Text, log2csv, isVaildBot };


module.exports = hn;