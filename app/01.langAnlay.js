// 언어 분석 기술 문어/구어 중 한가지만 선택해 사용

const fs = require("fs");
const { exit } = require("process");
const fsPromises = fs.promises;


class API {
    constructor(url,text,analysis_code,passage,question,type){
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
let apiObj ={};

let codeArray = {
    "형태소" : "morp",
    "어휘의미" : "wsd",
    "어휘의미_다의어":"wsd_poly",
    "개체명인식": "ner",
    "의존구문":"dparse",
    "의미역 인식":"srl"
}

// 언어 분석 기술(문어)
apiObj["언어분석(문어)"] = new API("http://aiopen.etri.re.kr:8000/WiseNLU","default_text",codeArray["형태소"]);
// 언어 분석 기술(구어)
apiObj["언어분석(구어)"] = new API("http://aiopen.etri.re.kr:8000/WiseNLU_spoken","default_text",codeArray["형태소"]);
//질의응답
apiObj["기계독해"] = new API("http://aiopen.etri.re.kr:8000/MRCServlet","","",test,"대항해시대는 시대사적으로 언제 해당하는가?");

apiObj["위키QA"] = new API("http://aiopen.etri.re.kr:8000/WikiQA","","","","1988년에 열린 올림픽은 어느 나라에서 열렸어?","hybridqa");

let X = {};
X=apiObj["위키QA"];
console.log(X);



let requestJson = {
    'access_key': access_key,
    'argument': {}
    }

if(X.text){ requestJson.argument["text"]=X.text};
if(X.analysis_code){ requestJson.argument["analysis_code"]=X.analysis_code};
if(X.passage){ requestJson.argument["passage"]=X.passage};
if(X.question){ requestJson.argument["question"]=X.question};
if(X.type){ requestJson.argument["type"]=X.type};

let request = require('request');
let options = {
    url: X.url,
    body: JSON.stringify(requestJson),
    headers: {'Content-Type':'application/json; charset=UTF-8'}
};
request.post(options, function (error, response, body) {
    console.log('responseCode = ' + response.statusCode);
    console.log(body);

    fsPromises.writeFile(`answer_${new Date().toISOString()}.json`,body, { encoding: "utf8", flag: "w", mode: 0o666 });
});