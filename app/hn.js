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
                //단순 텍스트 입력 --> NLP 모델 적용
                else if (body.content.type === "text") {
                    resolve([
                        {
                            botId: options.test_bot,
                            userId: body.source.userId,
                            isNLP: true,
                            json: {
                                content: {
                                    type: 'text',
                                    text: body.content.text
                                }
                            }
                        }]);
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
                        { "role": "system", "content": "You are an assistant that generates alias string list when people read the name of a drug." },
                        { "role": "system", "content": "You must use Korean characters when creating an alias string list. It should not generate numbers." },
                        { "role": "system", "content": "You must create alias string list of more than 5 words separated by commas character " },
            
                        { "role": "user", "content": "목시클정(아목시실린ㆍ클라불란산칼륨)(PTP)" }, { "role": "assistant", "content": "목시클PTP, 목시클정피티피, 목시클PTP포장, 목시클피티피, 목시클피티피포장, 목시클, 목시클정PTP포장, 목시클정피티피포장, 목시클정, 목시클정PTP" },
                        { "role": "user", "content": "목시클정(아목시실린·클라부란산칼륨)(PTP)" }, { "role": "assistant", "content": "목시클PTP, 목시클정피티피, 목시클PTP포장, 목시클피티피, 목시클피티피포장, 목시클, 목시클정PTP포장, 목시클정피티피포장, 목시클정, 목시클정PTP" },
                        { "role": "user", "content": "가스모틴에스알정" }, { "role": "assistant", "content": "가스모틴에스알제제, 가스모틴SR제제, 가스모틴에스알제재, 가스모틴SR정, 가스모틴SR제재, 가스모틴서방형, 가스모틴에스알, 가스모틴SR, 가스모틴서방정, 가스모틴에스알정" },
                        { "role": "user", "content": "베아리모정(피나스테리드)(PTP)" }, { "role": "assistant", "content": "베아리모정PTP, 베아리모PTP포장, 베아리모PTP정, 베아리모정피티피포장, 베아리모피티피정, 베아리모정PTP포장, 베아리모정피티피, 베아리모피티피포장" },
                        { "role": "user", "content": "이지덤 뷰티 릴리프 57매(약국용 파우치형)" }, { "role": "assistant", "content": "이지덤뷰티릴리프약국용파우치형, 이지덤뷰티릴리프약국용, 이지덤릴리프, 이지덤뷰티릴리프, 이지덤뷰티초록색, 이지덤뷰티릴리프파우치형, 이지덤초록색" },
                        { "role": "user", "content": "마그온맥스비 연질캡슐" }, { "role": "assistant", "content": "마그온맥스, 마그온맥스비연질캅셀, 마그온맥스비, 마그온맥스B연질캡슐, 마그온맥스비연질캡슐, 마그온맥스연질캅셀, 마그온맥스B연질캅셀, 마그온맥스B, 마그온맥스연질캡슐" },
                        { "role": "user", "content": "이지덤 뷰티 57매(약국용 파우치형)" }, { "role": "assistant", "content": "이지덤뷰티, 이지덤뷰티파우치형, 이지덤뷰티약국용, 이지덤뷰티오십칠매, 이지덤뷰티파란색, 이지덤뷰티57매, 이지덤파란색, 이지덤뷰티약국용파우치형" },
                        { "role": "user", "content": "[반품불가] 대웅풀타민주(아스코르브산)" }, { "role": "assistant", "content": "풀타민주, 대웅풀타민주, 대웅풀타민주사액, 대웅풀타민주아스코르브산, 풀타민주사제, 풀타민주사액, 대웅풀타민주사, 대웅풀타민주사제, 풀타민주사" },
                        { "role": "user", "content": "이지덤밴드 액티브케어 혼합형" }, { "role": "assistant", "content": "이지덤엑티브케어혼합형, 이지덤밴드혼합, 이지덤밴드사이즈혼합형, 이지덤액티브케어혼합, 이지덤밴드혼합형, 이지덤밴드액티브케어혼합형, 이지덤밴드액티브케어혼합" },
                        { "role": "user", "content": "푸루나졸주" }, { "role": "assistant", "content": "푸루나졸주사, 푸루나졸주, 프루나졸주사액, 프루나졸액, 푸루나졸주사액, 푸루나졸주사제, 프루나졸주, 프루나졸주사제, 푸루나졸정맥주사제, 푸루나졸정맥주사, 푸루나졸액" },
                        { "role": "user", "content": "이지덤 뷰티 99매(약국용)" }, { "role": "assistant", "content": "이지덤뷰티, 이지덤뷰티파우치형, 이지덤뷰티약국용, 이지덤뷰티구십구매, 이지덤뷰티파란색, 이지덤뷰티99매, 이지덤파란색, 이지덤뷰티약국용파우치형" },
                        { "role": "user", "content": "포시가정(PTP)" }, { "role": "assistant", "content": "포시가, 포시가정PTP, 포시가정PTP포장, 포시가피티피, 포시가PTP포장, 포시가PTP, 포시가정피티피포장, 포시가피티피포장, 포시가정, 포시가정피티피" },
                        { "role": "user", "content": "올메텍정(PTP)" }, { "role": "assistant", "content": "올메텍정피티피포장, 올메텍정피티피, 올메텍PTP, 올메텍정PTP, 올메텍정PTP포장, 올메텍피티피포장, 올메텍피티피, 올메텍, 올메텍PTP포장, 올메텍정" },
                        { "role": "user", "content": "이지덤밴드 액티브케어 대형" }, { "role": "assistant", "content": "이지덤밴드액티브케어큰거, 이지덤밴드사이즈대형, 이지덤밴드액티브케어대형, 이지덤밴드대형, 이지덤밴드큰거, 이지덤액티브케어큰거, 이지덤엑티브케어대형" },
                        { "role": "user", "content": "이지덤밴드 액티브케어 중형" }, { "role": "assistant", "content": "이지덤엑티브케어중형, 이지덤밴드중간, 이지덤밴드사이즈중형, 이지덤액티브케어중간, 이지덤밴드액티브케어중형, 이지덤밴드액티브케어중간, 이지덤밴드중형" },
                        { "role": "user", "content": "다이아벡스정(염산메트폴민)" }, { "role": "assistant", "content": "다이아벡스메트폴민, 다이아벡스정, 다이아벡스메트포르민, 다이아벡스, 다이아벡스정염산메트폴민, 다이아벡스정메트포르민, 다이아벡스정염산메트포르민" },
                        { "role": "user", "content": "아지로신정(PTP)" }, { "role": "assistant", "content": "아지로신정피티피, 아지로신피티피, 아지로신정PTP, 아지로신PTP포장, 아지로신정PTP포장, 아지로신PTP, 아지로신피티피포장, 아지로신정피티피포장" },
                        { "role": "user", "content": "올로스타정(PTP)" }, { "role": "assistant", "content": "올로스타정PTP포장, 올로스타PTP, 올로스타PTP포장, 올로스타피티피포장, 올로스타피티피, 올로스타정피티피, 올로스타정피티피포장, 올로스타정PTP" },
                        { "role": "user", "content": "가스모틴산(모사프리드시트르산염)" }, { "role": "assistant", "content": "가스모스틴산, 가스모틴산모사프라이드시트르산, 가스모틴산모사프라이드시트르산염, 가스모틴산모사프리드시트르산염, 가스모스틴산제" },
                        { "role": "user", "content": "리버골드파워연질캡슐" }, { "role": "assistant", "content": "리버골드연질캅셀, 리버골드파워, 리버골드, 리버골드연질캡슐, 리버골드캡슐, 리버골드캅셀, 리버골드파워연질캡슐, 리버골드파워연질캅셀" },
                        { "role": "user", "content": "글리아스타연질캡슐(콜린알포세레이트)" }, { "role": "assistant", "content": "글리아스타연질캡슐, 글리아스타, 글리아스타정, 글리아스타캅셀 , 글리아스타캡슐, 글리아스타연질캡슐콜린알포세레이트" },
                        { "role": "user", "content": "하루로신서방캡슐" }, { "role": "assistant", "content": "하루로신캡슐서방형, 하루로신서방캡슐, 하루로신서방형, 하루로신서방캅셀, 하루로신서방형캅셀, 하루로신서방형캡슐, 하루로신캅셀서방형" },
                        { "role": "user", "content": "마그온플러스 연질캡슐 120C (60Cx2EA)" }, { "role": "assistant", "content": "마그온플러스연질캅셀, 마그온플러스캡슐, 마그온플러스, 마그온플러스연질캡슐, 마그온플러스캅셀" },
                        { "role": "user", "content": "씨프러스정(염산시프로플록사신)" }, { "role": "assistant", "content": "씨플러스정, 시프러스정, 씨플러스정염산시프로플록사신, 시플러스정, 씨프러스정염산시프로플록사신, 씨프러스정" },
                        { "role": "user", "content": "액시드캡슐(니자티딘) 용기" }, { "role": "assistant", "content": "엑시드캡슐, 엑시드캅셀, 엑씨드, 액시드캅셀, 엑씨드캡슐, 엑씨드캅셀, 액씨드캡슐, 액시드캡슐, 액씨드캅셀" },
                        { "role": "user", "content": "이지엔6이브 연질캡슐(병포장) (이부프로펜 + 파마브롬)" }, { "role": "assistant", "content": "이지엔식스이브연질캅셀, 이지엔식스이브연질캡슐병포장, 이지엔6이브캡슐병포장, 이지엔6이브연질캅셀병포장, 이지엔6이브이부프로펜파마브롬병포장, 이지엔식스이브캅셀병포장" },

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