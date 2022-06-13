const axios = require("../node_modules/axios");
const botPayLoad = requrie("./payload.js");


const botInst = axios.create({
    baseURL: 'https://www.worksapis.com/v1.0/bots',
    headers: { 'Authorization': '####',"Content-Type":application/json},
    timeout: 1000,
  });



  let post_bots = async function(post_bots_payload){
      
    try { 
        const response = await botInst.post("/",payload);
        console.log(response);

    } catch(error) {
        console.log(error);
    }
  }
// 1. bot api
//bot 등록 | post
//bot 목록 조회 | get 
//bot 상세정보 조회  | /{botid}  | get 
//bot 수정 | /{botid}  | put
//bot 부문수정 | /{botid}  | put
//bot 삭제 | /{botid}  | delete 

// 2. bot 메세지방

// POST/bots/{botId}/channels 생성
// DELETE/bots/{botId}/channels/{channelId} 나가기
// GET/bots/{botId}/channels/{channelId}/members 목록 조회

// 3. Rich 메뉴 
// POST/bots/{botId}/richmenus
// GET/bots/{botId}/richmenus
// GET/bots/{botId}/richmenus/{richmenuId}
// DELETE/bots/{botId}/richmenus/{richmenuId}
// POST/bots/{botId}/richmenus/{richmenuId}/image
// GET/bots/{botId}/richmenus/{richmenuId}/image

// POST/bots/{botId}/richmenus/{richmenuId}/users/{userId}
// GET/bots/{botId}/richmenus/users/{userId}
// DELETE/bots/{botId}/richmenus/users/{userId}

// 4. 봇 도메인 
// POST/bots/{botId}/domains/{domainId}
// GET/bots/{botId}/domains
// PUT/bots/{botId}/domains/{domainId}
// PATCH/bots/{botId}/domains/{domainId}
// DELETE/bots/{botId}/domains/{domainId}

//5. 사용자 추가 삭제 
// POST/bots/{botId}/domains/{domainId}/members
// GET/bots/{botId}/domains/{domainId}/members
// DELETE/bots/{botId}/domains/{domainId}/members/{userId}

//6. 퍼 메뉴 

// POST/bots/{botId}/persistentmenu
// GET/bots/{botId}/persistentmenu
// DELETE/bots/{botId}/persistentmenu

// 7 . 컨텐츠 업로드 / 다운로드
// POST/bots/{botId}/attachments 
// GET/bots/{botId}/attachments/{fileId}
