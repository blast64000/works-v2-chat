const carousel = require("./carousel_template.json");
const bubble = require("./bubble_template.json");

const _ = require("lodash");
const mariadb = require('mariadb');
const axios = require("axios");
const options = require("../options.js");
const fs = require("fs");
const { exit } = require("process");


const messageReply = async function () {
  try {
    const fileRes = await fs.readFileSync('/home/ubuntu/works-v2-chat/books.txt', { encoding: 'utf8', flag: 'r' });

    let msgReqConfig = axios.create({
      headers: { "Content-Type": `application/json`, 'Authorization': `Bearer ${JSON.parse(fileRes).access_token}` },
      baseURL: 'https://www.worksapis.com/v1.0/bots/',
      timeout: 3000
    })


    let queryString = `SELECT QNA_BOT_CD, QNA_SEQ, QNA_INST_TIME, QNA_ASK_CONT, QNA_ANSW_USER_CD FROM chat_prod.qna_ms_tb
                    WHERE QNA_STATUS="PENDING" and qna_bot_cd="${options.hr_bot}"`
    const pool = mariadb.createPool(options.dbpool);
    let conn = await pool.getConnection();
    const rows = await conn.query(queryString);

    if (rows.length >= 1) {
      for await (let xi of rows) {
        console.log(xi);
        let tempRetCell = _.cloneDeep(carousel)
        let tempBubbleInst = _.cloneDeep(bubble)

        //console.log(bubbInst);
        tempBubbleInst.header.contents[1].text=`접수번호 : ${xi.QNA_SEQ}`;
        tempBubbleInst.body.contents[0].contents[0].text=xi.QNA_ASK_CONT
        tempBubbleInst.body.contents[1].contents[0].contents[1].text=xi.QNA_INST_TIME
        tempRetCell.content.contents.contents.push(tempBubbleInst);
        await msgReqConfig.post(`${xi.QNA_BOT_CD}/users/${xi.QNA_ANSW_USER_CD}/messages`, tempRetCell);
      }      
    }



  } catch (err) {
    console.log(err)
    //    console.log(Object.getOwnPropertyNames(err)); 
  } finally {
    exit();
  }
}

messageReply()

