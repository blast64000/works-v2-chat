let payload = {};

payload["addBot_Post"] = {
  "botName": "Example bot01",
    "photoUrl": "https://hbcookie.com/udca.png",
    "description": "test",
    "administrators": ['ac5309e2-7faf-40aa-187b-03761aa46f2c','ad256168-88b4-4b5c-1a5e-036c9f98d579'],    
      "subadministrators": [],
    "allowDomains": [210997],
    "enableCallback": true,
    "callbackEvents": ["text","location","sticker","image","file"],
    "callbackUrl": "https://hbcookie.com/",
    "enableGroupJoin": true,
//    "defaultRichmenuId": "40001",
//    "i18nBotNames": [      {"language": "en_US","botName": "Example bot"}],
//    "i18nDescriptions": [      {        "language": "en_US",        "description": "Example description"}],
//    "i18nPhotoUrls": [      {        "language": "en_US",        "photoUrl": "https://example.com/favicon.png"      }    ]
};
payload["addBot_Get"] = {};


payload["modifyBot_Get"] = {};

payload["modifyBot_Put"] = {
  "botName": "Example bot-put",
  "photoUrl": "https://hbcookie.com/udca.png",
  "description": "WorksMobile's A.I. conversation enabled bot put edited",
  "administrators": ['ac5309e2-7faf-40aa-187b-03761aa46f2c','ad256168-88b4-4b5c-1a5e-036c9f98d579'],    
  "subadministrators": [],
  "allowDomains": [210997],
  "enableCallback": true,
  "callbackEvents": ["text","location","sticker","image","file"],
  "callbackUrl": "https://hbcookie.com/",
  "enableGroupJoin": true,
//    "defaultRichmenuId": "40001",
//    "i18nBotNames": [      {"language": "en_US","botName": "Example bot"}],
//    "i18nDescriptions": [      {        "language": "en_US",        "description": "Example description"}],
//    "i18nPhotoUrls": [      {        "language": "en_US",        "photoUrl": "https://example.com/favicon.png"      }    ]
};
payload["modifyBot_Patch"] = {};
payload["modifyBot_Delete"] = {};

payload["handleChannels_post"] = {
  "members": [
    "ad256168-88b4-4b5c-1a5e-036c9f98d579",
    "ac5309e2-7faf-40aa-187b-03761aa46f2c"

  ],
  "title": "channel make test 01"
};

payload["handleChannels_Delete"] = {};
payload["handleChannels_Delete"] = {};

payload["modifyDomain_Post"] = {
  visible:false
};
payload["modifyDomain_Get"] = {};

payload["modifyDomain_Put"] = {
  visible:true
};
payload["modifyDomain_Patch"] = {
  visible:true
};
payload["modifyDomain_Delete"] = {
};

payload["modifyBotUser_Post"] = {
  userId:`blast64000@hbcookie.com`
};
payload["modifyBotUser_Get"] = {};
payload["modifyBotUser_Delete"] = {};

payload["addRichMenu_Post"] = {

  "richmenuName": "펙수 메인 리치메뉴_v1",
  "areas": [
    //1.메인화면
    {
      "action": {
        "type": "postback",
        "label": "메인 화면",
        "displayText": "메인 화면",
        "data":"C00-F10000",
      },
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 1250,
        "height": 421
      }
    },
    //2.펙수클루 제품개요
    {
      "action": {
        "type": "postback",
        "label": "제품 개요",
        "displayText": "제품 개요",
        "data":"C00-F90001,C00-F90002",
      },
      "bounds": {
        "x": 1250,
        "y": 0,
        "width": 1250,
        "height": 421
      }
    },//3.파이프라인
    {
      "action": {
        "type": "postback",
        "label": "파이프라인",
        "displayText": "파이프라인",
        "data":"C00-F90003",
      },
      "bounds": {
        "x": 0,
        "y": 421,
        "width": 1250,
        "height": 422
      }
    },//4.성공모델
    {
      "action": {
        "type": "postback",
        "label": "주요 판촉자료",
        "displayText": "주요 판촉자료",
        "data":"C00-F90004,C00-F90005,C00-F90006",
      },
      "bounds": {
        "x": 1250,
        "y": 421,
        "width": 1250,
        "height": 422
      }
    }
  ],
  "size": {
    "width": 2500,
    "height": 843
  }

};

payload["modifyRichMenu_Get"] = {};
payload["modifyRichMenu_Delete"] = {};


payload["appendRichMenuImage_Get"] = {

};

payload["appendRichMenuImage_Post"] = {
    "fileId": "kr1.1657777541597561865.1657863941.1.3904290.0.0.0"
};



module.exports = payload;
