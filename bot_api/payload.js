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
  visible:false
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

  "richmenuName": "Example Richmenu",
  "areas": [
    {
      "action": {
        "type": "postback",
        "label": "Example label",
        "data": "Example data",
        "displayText": "Example displayText",
        "postback":"postback"
      },
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 2500,
        "height": 843
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
    "fileId": "jp1.1628695315008671000.1628781715.0.1000001.0.0.0"
};



module.exports = payload;
