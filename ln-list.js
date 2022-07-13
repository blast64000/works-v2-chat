// ♥ : [] 되있는거 다 Map 구조로 바꾸기 

let ContNode = class {
    constructor(data) {
        this.botCode = data.CONT_BOT_CD;
        this.contCode = data.CONT_CD;
        this.contType = data.CONT_TYPE;
        this.contText = data.CONT_TXT;
        this.contActSetCode = data.CONT_ACT_SET_CD;
        this.contPreImg = data.CONT_IMG_PRE;
        this.contOrgImg = data.CONT_IMG_ORI;
        this.contImgId=data.CONT_IMG_ID;
        this.contKwd = data.CONT_KWD;
        this.contAftMsg = data.CONT_AFT_MSG;
        this.contBefMsg = data.CONT_BEF_MSG;
        this.contActionSet = [];
    }
    appendActionSet(actionList) {
        for (let i = 0; i < actionList.length; i++) {

            if (this.contActSetCode === actionList[i].actSetCode) {
                this.contActionSet.push(actionList[i]);
            } else {
                continue;
            }
        }
    }

}

let ActNode = class {
    constructor(data) {
        this.actCode = data.ACT_CD;
        this.actSetCode = data.ACT_SET_CD;
        this.actType = data.ACT_TYPE;
        this.actName = data.ACT_NM;
        this.nextContCode = data.ACT_CONT_CD;
        this.actIdentCode = data.ACT_IDENT_CD;
        this.nextNode = null;
    }
    
    appendNextCont(contentList) {
        for (let xi = 0; xi < contentList.length; xi++) {
            if (this.nextContCode === contentList[xi].contCode) {
                this.nextNode = contentList[xi]
                return 1;
            } else {
                //error 
                continue;
            }

        }


    }
}

let BotNode = class {
    constructor(chatBotList) {
        this.botCode = chatBotList.BOT_CD;
        this.botName = chatBotList.BOT_NM;
        this.botWorksCode = chatBotList.BOT_WORKS_CD;
        this.botStartCode = chatBotList.BOT_CONT_CD;

        this.botStartNode = null;
        this.botRevTxtList = [];
    }

    appendEntryPoint(contentList) {
        for (let i = 0; i < contentList.length; i++) {
            if (this.botStartCode === contentList[i].contCode) {
                this.botStartNode = contentList[i]
            } else {

            }
        }
    }
    
    appendReservedText(textList){
        for(let ti of textList){
            if (this.botCode === ti.TXT_BOT_CD){
                this.botRevTxtList.push(ti);
            }
            else { 

            }
        }

        
    }
    
}

module.exports = { ContNode, ActNode, BotNode };