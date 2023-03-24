const carousel = require("./carousel_template.json");
const bubble = require("./bubble_template.json");
const _ = require("lodash");

const fs = require("fs");
const axios = require("axios");
const path = require("path");
const mariadb = require('mariadb');
const options = require("../options.js");


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
    try {
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

            case "image_carousel":
                console.log(contObj);
                retObj.json.content.type = contObj.contType;
                retObj.json.content.columns = [];
                for (let ic of contObj.contActionSet) {
                    if (ic.actIdentCode === "*") {
                        retObj.json.content.columns.push(
                            ic.actType === "message" ?
                                {
                                    "originalContentUrl": ic.actImgUrl,
                                    "action": {
                                        "type": ic.actType,
                                        "label": ic.actName,
                                        "text": ic.actName,
                                        "postback": ic.nextContCode
                                    }
                                }
                                : ic.actType === "uri" ?
                                    {
                                        "originalContentUrl": ic.actImgUrl,
                                        "action": {
                                            "type": ic.actType,
                                            "label": ic.actName,
                                            "uri": ic.nextContCode
                                        }
                                    }
                                    : 0
                        )
                    }
                    else {
                        console.log("enter image_carousel_else");
                    }
                }
                console.log(retObj.json.content);
                return retObj;
                break;

            case "flex":
                //답변자 변경
                retObj.userId = options.admin_id_list[0];
                let tempRetCell = _.cloneDeep(carousel)
                let tempBubbleInst = _.cloneDeep(bubble)

                //console.log(bubbInst);
                tempBubbleInst.header.contents[1].text = `접수번호 : 비밀 ♥`;
                tempBubbleInst.body.contents[0].contents[0].text = reqbody.content.text.slice(1);
                tempBubbleInst.body.contents[1].contents[0].contents[1].text = reqbody.issuedTime
                tempRetCell.content.contents.contents.push(tempBubbleInst);
                retObj.json = tempRetCell;
                return retObj;
                break;


                break;
            default:
                return {};
        }
    } catch (err) {
        console.log(err);
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


const makeQueryJson = function (qnaType, qnaText, qnaTime, qnaUserId, qnaBotId, qnaDomainID) {

    try {

        let yourDate = new Date(qnaTime)
        yourDate.setHours(yourDate.getHours() + 9);
        console.log(yourDate.toISOString().replace(/T/, " ").replace(/Z/, ""));

        let queryString = ""
        let queryUpdateString = ""
        let qndID = "1"
        //text pharse 
        switch (qnaType) {
            case "INSERT":


                queryString = `INSERT INTO chat_prod.qna_ms_tb
            (QNA_BOT_CD, QNA_INST_TIME, QNA_STATUS, QNA_DOM_CD, QNA_ASK_USER_CD, QNA_ASK_CONT,QNA_ANSW_USER_CD)
            VALUES('${qnaBotId}', '${yourDate.toISOString().replace(/T/, " ").replace(/Z/, "")}', 'PENDING', '${qnaDomainID}', '${qnaUserId}', '${qnaText}','${options.admin_id_list[0]}');`
                break;
            case "LIST":
                queryString = `SELECT * FROM chat_prod.qna_ms_tb
            where QNA_STATUS="PENDING" and QNA_ANSW_USER_CD="${qnaUserId}" `
                break;
            case "ANSWER":
                console.log(qnaText.split("!").length);
                if (qnaText.split("!").length >= 3) {
                    qndID = qnaText.split("!")[1].trim()
                    queryString = `SELECT QNA_ASK_USER_CD FROM chat_prod.qna_ms_tb where QNA_SEQ=${qndID}`
                    queryUpdateString = `UPDATE chat_prod.qna_ms_tb SET QNA_STATUS='DONE',  QNA_ANSW_CONT='${qnaText.split("!")[2].trim()}' WHERE QNA_SEQ=${qndID} and QNA_ANSW_USER_CD="${qnaUserId}"`
                    break;
                }

                else {
                    //! command error
                }



            case "REJECT":
                break;
            default:
                break;
        }
        return {
            "json": "db_access",
            "queryType": qnaType,
            "queryString": queryString,
            "queryUpdateString": queryUpdateString
        }

    } catch (err) {
        console.log(err);
    }


}

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
                //단순 텍스트 입력인 경우 
                else if (body.content.type === "text") {
                    if (botInst) {

                        // # Search
                        if (body.content.text.charCodeAt(0) === 35) {
                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, hashSearch(body.content.text.slice(1).toUpperCase(), actionInstList, botInst)))
                            resolve(retArray)
                        }

                        // !handling
                        else if (body.content.text.charCodeAt(0) === 33) {
                            let reservedWords = ["SELECT", "LIST", "ANSWER", "INSERT", "DONE", "REJECT", "WAITING", "TRANS"]
                            reservedWords.includes(body.content.text.split('!')[1].toUpperCase().trim()) ?
                                (
                                    //   console.log(options.admin_id_list),
                                    options.admin_id_list.includes(body.source.userId) ?
                                        (
                                            console.log("admin"),
                                            body.content.text.split('!')[1].toUpperCase().trim() === "ANSWER" ? (
                                                retArray.push(makeQueryJson("ANSWER", body.content.text.slice(1), body.issuedTime, body.source.userId, headers["x-works-botid"], body.source.domainId)),
                                                retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "flex" }))
                                            )
                                                :
                                                (
                                                    retArray.push(makeQueryJson(body.content.text.split('!')[1].toUpperCase().trim(), body.content.text.slice(1), body.issuedTime, body.source.userId, headers["x-works-botid"], body.source.domainId)),
                                                    retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "text", contText: `IMPORT_VALUE.` }))
                                                )
                                        ) :
                                        (
                                            console.log("not admin"),
                                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "text", contText: `you are not admin can't use this command` }))
                                        )
                                )
                                :
                                (
                                    options.admin_id_list.includes(body.source.userId) ?
                                        (
                                            //retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "text", contText: `admin can't insert qna` }))
                                            retArray.push(makeQueryJson("INSERT", body.content.text.slice(1), body.issuedTime, body.source.userId, headers["x-works-botid"], body.source.domainId)),
                                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "text", contText: `접수가 완료 되었습니다.` })),
                                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "flex" }))
                                        )
                                        :
                                        (
                                            // 1.db access 2. sender message 3. receiver message
                                            retArray.push(makeQueryJson("INSERT", body.content.text.slice(1), body.issuedTime, body.source.userId, headers["x-works-botid"], body.source.domainId)),
                                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "text", contText: `접수가 완료 되었습니다.` })),
                                            retArray.push(makeAnswerJson(headers["x-works-botid"], body, { contType: "flex" }))
                                        )
                                )
                            resolve(retArray)
                        }
                        //저장 예약어
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
                    }
                    // 디폴트 
                }
                break;
            case "postback":
                let pbCountList = body.data.split(",");
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
        console.log(error.data);
    });
}


let responseBotMsg = async function (objArray, baseHeaders, poolConfig) {
    console.log(objArray);
    let returnDataStream = ""
    let flexRecvChangeStream=""
    let flexRecvtextStream=""

    let insertRowID = 0

    let reqConfig = axios.create({
        baseURL: `https://www.worksapis.com/v1.0/`,
        headers: baseHeaders,
        timeout: 3000
    });


    for await (let ti of objArray) {
        try {
            if (ti === 0) { continue }
            else if (ti.queryString === "") { returnDataStream = "오류발생" }
            else if (ti.json === "db_access") {

                const pool = mariadb.createPool(poolConfig);
                let conn = await pool.getConnection();
                const rows = await conn.query(ti.queryString);
                console.log(rows);
                //rowsInsertCheck()
                if (ti.queryType === "LIST") {
                    if (rows.length === 0) {
                        returnDataStream = "접수 된 내역이 없습니다."
                    }
                    else {
                        for (let a of rows) {
                            returnDataStream += `접수번호 : ${a.QNA_SEQ}, \n 접수내용 : ${a.QNA_ASK_CONT}\n ========================\n`
                        }
                    }
                    //returnDataStream= JSON.stringify(rows[10]);
                }
                else if (ti.queryType === "ANSWER") {
                    //if (rows.affectedRows === 1) {
                    if (rows.length === 1) {
                        const rows2 = await conn.query(ti.queryUpdateString);
                        if(rows2.affectedRows===1){
                            flexRecvChangeStream=rows[0].QNA_ASK_USER_CD;
                            returnDataStream = "답변이 완료되었습니다.";

                        }
                        else { 
                            returnDataStream = "오류 발생.";
                        }
                        
                    }
                    else {
                        returnDataStream = `입력 오류 , 해당하는 문의번호가 없습니다.`
                    }
                }

                else if (ti.queryType === "INSERT") {
                    insertRowID = rows.insertId;//biGInt
                }
                else {
                    console.log("a");
                }

            }
            else {

                if (returnDataStream !== "") {
                    console.log(ti);
                    ti.json.content.text = returnDataStream
                }
                
                if (flexRecvChangeStream!==""){
                    console.log("change userId")
                    ti.json.content.text=flexRecvtextStream
                    ti.userId=flexRecvChangeStream;
                }

                if (insertRowID > 0 && ti.json.content.type === "flex") {
                    console.log(ti.json.content.contents.contents[0].header.contents[1].text);
                    ti.json.content.contents.contents[0].header.contents[1].text = `접수번호 : ${insertRowID}`
                }

                let startTime = 0;
                let endTime = 0;

                startTime = new Date().getTime();
                apiFunc = await reqConfig.post(`bots/${ti.botId}/users/${ti.userId}/messages`, ti.json);
                endTime = new Date().getTime();
                console.log(endTime - startTime);
                await new Promise(resolve => setTimeout(resolve,
                    (endTime - startTime) > 0 ? (1000 - (endTime - startTime)) : 10));
            }

        } catch (err) {
            console.log("error occured");
            console.log(err);

        } finally {

        }
    }
}

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

const hr = { vaildateMessage, responseBotMsg, json2Text, log2csv, isVaildBot };
module.exports = hr;