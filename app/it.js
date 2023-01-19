const fs = require("fs");
const fsPromises = fs.promises;
const axios = require("axios");
const path = require("path");
const { exit } = require("process");
const options = require("../options.js");
const request = require('request');

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
                            botId: options.it_bot,
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
                        botId: options.it_bot,
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
                        botId: options.it_bot,
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


    let reqConfig = axios.create({
        baseURL: `https://www.worksapis.com/v1.0/bots/`,
        headers: baseHeaders,
        timeout: 3000
    });
    //test

    for await (let ti of objArray) {
        console.log(ti);
        if (ti === 0) { continue }
        else if (ti.isInbound) {
            let bodyDetail = ``;
            doc.useServiceAccountAuth(creds);
            await doc.loadInfo();
            // console.log(doc);
            const sheet = doc.sheetsByIndex[0]; doc.sheetsByTitle[doc.title]
            const rows = await sheet.getRows();
            const newObj = rows[rows.length - 1];
            //javascript backtick
            bodyDetail = `안녕하세요. 나보타X브이올렛 카카오톡 챗봇에 새로운 문의 내역이 저장되었습니다.
            \n\n ✔ 저장시각: ${newObj._rawData[0].slice(0, -3)}
            \n ✔ 병원명: ${newObj._rawData[1]}
            \n ✔ 닥터명: ${newObj._rawData[2]}
            \n ✔ 전화번호: ${newObj._rawData[3]}
            \n ✔ 이메일주소:  ${newObj._rawData[4]}
            \n ✔ 문의 사항: ${newObj._rawData[5]}
            \n ✔ 개인정보 동의 여부: ${newObj._rawData[6]}
            \n\n 좋은 하루 보내세요. 감사합니다.`
            ti.json.content.text = bodyDetail;
        }
        else if (ti.isNLP) {
            
            let answer = await requestNLP(ti.json.content.text);
            let answerObj = JSON.parse(answer);
            console.log(answerObj);
            if(answerObj.return_object.WiKiInfo.AnswerInfo.length>0){
            ti.json.content.text = `정답 : ${answerObj.return_object.WiKiInfo.AnswerInfo[0].answer}\n 정확도 : ${answerObj.return_object.WiKiInfo.AnswerInfo[0].rank}`
            } else { 
                ti.json.content.text=`잘 모르겠어요 데헷 >_< `
            }
        }        

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



let requestNLP = function (myquestion) {
    return new Promise((resolve, reject) => {
        class API {
            constructor(url, text, analysis_code, passage, question, type) {
                this.url = url;
                this.text = text;
                this.analysis_code = analysis_code;
                this.passage = passage;
                this.question = question;
                this.type = type;
            }
        }

        let access_key = `abf571c1-53f3-411a-99de-d1e72e6ca220`;
        let test = `대항해시대(大航海時代, 영어: Era das Grandes Navegações, 영어: Age of Discovery, Age of Exploration)는 유럽사에서 대략 15세기에서 17세기까지를 가리키는 말이다. 시대사적으로 근세에 해당하며, 기술사적으로는 범선 시대와 거의 겹친다. 이 시대에 이루어진 대규모 해양탐험은 향후의 유럽 문화, 특히 유럽 백인의 미주 식민의 강력한 요인이 되었다. 여러 유럽 국가들에서 식민주의를 정책사업으로 채택한 것도 이 시대였다. 즉, 대항해시대란 유럽 식민화의 제1물결(the first wave of European colonization)과 동의어라고 할 수 있다. 1336년 포르투갈 왕국의 카나리아 제도 탐험으로 시작된[1] 대항해시대는 1434년 마데이라섬 및 아조레스섬, 1498년의 서아프리카 해안 탐험을 거쳐 1498년 바스쿠 다 가마가 인도항로를 개척하면서 본격적으로 전개되기 시작했다. 특히 다 가마의 인도 항해는 포르투갈이 인도양 일대에 식민정착지를 건설하기 시작한 분수령이기에 매우 중요하다고 평가받는다.이후 에스파냐의 후원을 받은 크리스토퍼 콜럼버스가 아메리카 대륙 항로를 개척한 것(1492년-1504년)은 유럽사를 넘어 전세계사적 중요성을 가진 엄청난 사건이었다. 대항해시대 이전에도 유럽인이 미주대륙에 간 역사가 없는 것은 아니지만, 대항해시대의 미주 재발견은 유럽인들의 대규모 식민과 그에 수반하는 생물학적 교환, 대서양 삼각무역의 정착 같은 파급효과를 낳았고, 그 파급과 결과는 현대까지도 지속되고 있다. 그래서 대개 에스파냐의 “신대륙 발견”이 근세의 시작점으로 여겨진다. 몇 년(1519년-1522년) 뒤에는 마젤란-엘카노 원정대가 최초의 세계일주에 성공하면서 지구설의 물증이 확보되었다. 이러한 선행 항해들에서 가능성을 본 유럽 각국은 대서양, 인도양, 태평양 곳곳과 미지의 신대륙 내륙에 원정대를 파견했으며, 그 추세는 남북극이 개척되는 20세기 초까지도 계속되었다.`
        let apiObj = {};

        let codeArray = {
            "형태소": "morp",
            "어휘의미": "wsd",
            "어휘의미_다의어": "wsd_poly",
            "개체명인식": "ner",
            "의존구문": "dparse",
            "의미역 인식": "srl"
        }

        // 언어 분석 기술(문어)
        apiObj["언어분석(문어)"] = new API("http://aiopen.etri.re.kr:8000/WiseNLU", "default_text", codeArray["형태소"]);
        // 언어 분석 기술(구어)
        apiObj["언어분석(구어)"] = new API("http://aiopen.etri.re.kr:8000/WiseNLU_spoken", "default_text", codeArray["형태소"]);
        //질의응답
        apiObj["기계독해"] = new API("http://aiopen.etri.re.kr:8000/MRCServlet", "", "", test, "대항해시대는 시대사적으로 언제 해당하는가?");

        apiObj["위키QA"] = new API("http://aiopen.etri.re.kr:8000/WikiQA", "", "", "", myquestion, "hybridqa");

        let X = {};
        X = apiObj["위키QA"];

        let requestJson = {
            'access_key': access_key,
            'argument': {}
        }

        if (X.text) { requestJson.argument["text"] = X.text };
        if (X.analysis_code) { requestJson.argument["analysis_code"] = X.analysis_code };
        if (X.passage) { requestJson.argument["passage"] = X.passage };
        if (X.question) { requestJson.argument["question"] = X.question };
        if (X.type) { requestJson.argument["type"] = X.type };

        let options = {
            url: X.url,
            body: JSON.stringify(requestJson),
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        };
        request.post(options, function (error, response, body) {
            console.log('responseCode = ' + response.statusCode);
            if(response.statusCode===200){
                resolve(body);
            }
        });


    })



}


const it = { vaildateMessage, responseBotMsg, json2Text, log2csv, isVaildBot };


module.exports = it;