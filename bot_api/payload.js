let payload = {};

payload["refresh"]={
  "content": {
    "type": "text",
    "text": "챗봇 테스트중입니다."
  }
}


payload["flex"] = 
{ 
  "content":{
    "type": "flex",
    "altText": "this is a flexible template",
    "contents": {
      "type": "carousel",
      "contents": [
        {
          "type": "bubble",
          "size": "kilo",
          "header": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "Today",
                "size": "xl",
                "weight": "bold",
                "color": "#ffffff"
              }
            ],
            "backgroundColor": "#0AACF7"
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/rtfW312/todo-check.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Weekly Meeting",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#767676"
                  },
                  {
                    "type": "text",
                    "text": "10:00 AM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "none"
              },
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/rtfW312/todo-check.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Lunch",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#767676"
                  },
                  {
                    "type": "text",
                    "text": "12:00 PM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "lg"
              },
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/rtfW312/todo-check.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Budget Review",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#767676"
                  },
                  {
                    "type": "text",
                    "text": "3:00 PM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "lg"
              },
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/rtfW312/todo-check.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Conference Call",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#767676"
                  },
                  {
                    "type": "text",
                    "text": "4:30 PM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "lg"
              },
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/TYZM8gT/todo-uncheck.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Dinner",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#0AACF7",
                    "weight": "bold"
                  },
                  {
                    "type": "text",
                    "text": "7:00 PM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "lg"
              }
            ],
            "paddingBottom": "15px",
            "margin": "none",
            "paddingTop": "15px"
          }
        },
        {
          "type": "bubble",
          "size": "kilo",
          "header": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
              {
                "type": "text",
                "text": "Tomorrow",
                "wrap": true,
                "weight": "bold",
                "size": "xl",
                "color": "#ffffff"
              }
            ],
            "backgroundColor": "#FF6B6E"
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/rtfW312/todo-check.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Budget Wrap-up",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#767676"
                  },
                  {
                    "type": "text",
                    "text": "9:00 AM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "none"
              },
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/TYZM8gT/todo-uncheck.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Lunch Meeting",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#FF6B6E",
                    "weight": "bold"
                  },
                  {
                    "type": "text",
                    "text": "12:00 PM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "lg"
              },
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://i.ibb.co/TYZM8gT/todo-uncheck.png",
                    "size": "lg",
                    "offsetTop": "4px"
                  },
                  {
                    "type": "text",
                    "text": "Orientation",
                    "margin": "lg",
                    "gravity": "center",
                    "flex": 2,
                    "color": "#FF6B6E",
                    "weight": "bold"
                  },
                  {
                    "type": "text",
                    "text": "2:00 PM",
                    "weight": "regular",
                    "gravity": "center",
                    "align": "end",
                    "flex": 1,
                    "size": "sm",
                    "color": "#999999"
                  }
                ],
                "margin": "lg"
              }
            ],
            "paddingTop": "15px",
            "paddingBottom": "15px"
          }
        }
      ]
    }
}

}

payload["init_force"] = { 

    "content": {
      "type": "button_template",
      "contentText": `영웅톡 챗봇 시작하기`,
      "actions": [
        {
        "type": "message",
        "label": "안녕",
        }
    ]
    }
}


payload["directMsg"] = { 

  "content": {
    "type": "text",
    "text": "Please select your favorite food category!",
    "quickReply": {
      "items": [
        {
//          "imageUrl": "https://www.example.com/a.png",
          "action": {
            "type": "message",
            "label": "sushi",
            "text": "Sushi"
          }
        },
        {
//          "imageUrl": "https://www.example.com/b.png",
          "action": {
            "type": "message",
            "label": "Italian",
            "text": "Italian"
          }
        },
        {
          "action": {
            "type": "camera",
            "label": "Open Camera"
          }
        },
        {
          "action": {
            "type": "uri",
            "label": "uri",
            "uri":"https://naver.com"
          }
        },
        {
          "action": {
            "type": "location",
            "label": "Location"
          }
        }



      ]
    }
  }
}


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

//펙수 2500 x 843 
payload["addRichMenu_Post_fexu"] = {

  "richmenuName": "펙수 메인 리치메뉴_v2",
  "areas": [
    //1.메인화면
    {
      "action": {
        "type": "postback",
        "label": "메인 화면",
        "displayText": "메인 화면",
        "data":"C00-F100000",
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

//영웅톡 2500 x 1686
payload["addRichMenu_Post_hero"] = {

  "richmenuName": "영웅톡 v5",
  "areas": [
    //1.메인화면
    // {
    //   "action": {
    //     "type": "message",
    //     "label": "메인화면★",
    //     "text": "메인화면★",
    //     "postback ":"C00-H100004"
    //   },
    //   "bounds": {
    //     "x": 0,
    //     "y": 0,
    //     "width": 2,
    //     "height": 2
    //   }
    // },
    {
      "action": {
        "type": "message",
        "label": "메인화면",
        "text": "메인화면",
        "postback ":"C00-H100000"
      },
      "bounds": {
        "x": 2,
        "y": 2,
        "width": 1248,
        "height": 841
      }
    },
    //2. 영웅톡 이용 팁
    {
      "action": {
        "type": "message",
        "label": "이용팁",
        "text": "이용팁",
        "postback":"C00-H200001"
      },
      "bounds": {
        "x": 1250,
        "y": 5,
        "width": 1250,
        "height": 843
      }
    },//3. 다빈도 문의사항
    {
      "action": {
        "type": "message",
        "label": "다빈도",
        "text": "다빈도",
        "postback":"C00-H200002",
      },
      "bounds": {
        "x": 0,
        "y": 843,
        "width": 1250,
        "height": 843
      }
    },//4.추가 문의 요청
    {
      "action": {
        "type": "message",
        "label": "추가문의",
        "text": "추가문의",
        "postback":"C00-H200003",
      },
      "bounds": {
        "x": 1250,
        "y": 843,
        "width": 1250,
        "height": 843
      }
    }
  ],
  "size": {
    "width": 2500,
    "height": 1686
  }

};



payload["modifyRichMenu_Get"] = {};
payload["modifyRichMenu_Delete"] = {};
payload["appendRichMenuImage_Get"] = {};
payload["appendRichMenuImage_Post"] = {
    "fileId": "kr1.1676246886941162546.1676333286.1.3000497.0.0.0"
};



module.exports = payload;
