const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path")

const http = require('http')
const https = require('https')

const express = require("express")
const bodyParser = require("body-parser")

let options = require("./options.js")
const initFunc = require("./axios_post.js")
const dbconn = require("./db-conn.js")
const lklist = require("./ln-list.js");


const fexu = require("./app/fexu.js");
const it = require("./app/it.js");



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

let isVaildBot = function (worksBotNo, botInstList) {
    for (bi of botInstList) {
        if (bi.botWorksCode === worksBotNo) {
            return bi;
        }
    }
    console.log("error : bot number is not exist");
    return 0;
};


const initialize = async function () {
    let res = {};
    // 하루 1회 리딩
    res = await initFunc.getJWT();
    res.tokenTime = new Date();
    await fsPromises.writeFile("books.txt", JSON.stringify(res) + `\n`, { encoding: "utf8", flag: "w", mode: 0o666 });
    // 이후 book.txt 리드
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

app.post("*", wraper(async (req, res, next) => {
    const { headers, method, url } = req;
    //    console.log(Object.keys(req));
    console.log(`\n== check post method: ${method}, url :${url} ==`);
    if (fexu.isVaildBot(headers["x-works-botid"], botInstList)) {
        next();
    }

    else {
        console.log("it's not a vaild bot");
        //필요하다면 meesage Text 로 현재 응답할 수 있는 상태가 아니다
        res.status(404).end();
    }
}));

app.post("/it", wraper(async (req, res, next) => {
    try {
        const { headers, body } = req;
        console.log(headers);
        console.log(body);

        let answerObj = await fexu.vaildateMessage(req, contentInstList, botInstList, actionInstList);
        let retMsg = await fexu.responseBotMsg(answerObj, baseHeaders);
        logreturn = await fexu.json2Text(headers, body);
        if (logreturn) {
            it.log2csv(logreturn, __dirname);
        }

    } catch (err) {
        console.log(Object.getOwnPropertyNames(err))
    }

}));


app.post("/fexu", wraper(async (req, res, next) => {
    try {
        const { headers, body } = req;
        console.log(headers);
        console.log(body);

        let answerObj = await fexu.vaildateMessage(req, contentInstList, botInstList, actionInstList);
        let retMsg = await fexu.responseBotMsg(answerObj, baseHeaders);

        logreturn = await fexu.json2Text(headers, body);
        if (logreturn) {
            fexu.log2csv(logreturn, __dirname);
        }

    } catch (err) {
        console.log(Object.getOwnPropertyNames(err))
    }

    // 데이터 전송
    //postback으로 받는 데이터로 여러 입력을 처리할 수있어야됨

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

app.post("/refresh", wraper(async (req, res, next) => {

    console.log("== refresh occured ==");
    const { headers, body } = req;
    console.log(body);
    if (body.clisecret === options.clisecret) {
        let refObj = {};
        refObj = await initFunc.getJWT();
        refObj.tokenTime = new Date();
        await fsPromises.writeFile("books.txt", JSON.stringify(refObj) + `\n`, { encoding: "utf8", flag: "w", mode: 0o666 });
        if (refObj.access_token) {
            baseHeaders.Authorization = `Bearer ${refObj.access_token}`
            console.log(baseHeaders);
        }
        res.status(200).send('refresh value');
    }


}));

initialize().then(() => {
    http.createServer(options, app).listen(80);
    https.createServer(options, app).listen(443);
}
)
