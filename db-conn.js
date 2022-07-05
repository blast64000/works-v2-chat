const mariadb = require('mariadb');
//const async = require('async');

const serverName = 'chat_prod'


let makeClause = function(colName, memberName, dataArray) {
    var iter;
    var returnClause = "";
    returnClause += colName;
    returnClause += ' IN (';

    for (iter = 0; iter < dataArray.length; iter++) {
        returnClause += '\'';
        returnClause += dataArray[iter][memberName];
        returnClause += '\'';
        returnClause += ',';
    };

    returnClause = returnClause.slice(0, -1);
    returnClause += ')';
    return returnClause;
};


exports.readMasterTable = async function(poolConfig) {
    console.log(poolConfig)
    let conn;

    pool = mariadb.createPool(poolConfig);

    try {
        conn = await pool.getConnection();
        // 활성화된 봇 리스트를 긁어옴
        const botMaster = await conn.query(`select * from ${serverName}.bot_ms_tb where BOT_USE_ST=1`);

        // 해당하는 봇번호만 추출하여 컨텐츠 긁어오기 
        const contentMaster = await conn.query(`select * from ${serverName}.cont_ms_tb where ${makeClause('CONT_BOT_CD', 'BOT_CD', botMaster)}`);

        // 해당하는 봇번호만 추출하여 예약텍스트 긁어오기
        const textMaster = await conn.query(`select * from ${serverName}.txt_ms_tb where ${makeClause('TXT_BOT_CD', 'BOT_CD', botMaster)}`);

        // 해당하는 set 번호가 잇는 추출하여 액션 긁어오기 
        const actionMaster = await conn.query(`select * from ${serverName}.act_ms_tb where  ${makeClause('ACT_SET_CD', 'CONT_ACT_SET_CD', contentMaster)}`);

        // 해당하는 set 번호가 잇는 추출하여 매출 테이블 긁어오기
        const saleMaster = await conn.query(`select * from ${serverName}.sales_ms_tb `);
    
        conn.end();
        return [botMaster, contentMaster, actionMaster, textMaster,saleMaster];


    } catch (err) {

        throw err;
    } finally {
        //The finally clause is always executed
        if (conn) {
            conn.end()
        };
    }

}