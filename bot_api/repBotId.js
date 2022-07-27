const fs = require("fs");
const axios = require("axios");
const {parse} = require("csv-parse");
const { assert } = require("console");


let get_users_email = async function (userid, callback) {
        try {
            const response = await reqConfig.get(`/users/${userid}`, {
              //  data : payload      
            });
            //console.log(response.data);
            callback({"email" : response.data.email, "name": `${response.data.userName.lastName} ${response.data.userName.firstName}`});
        } catch (error) {
            //console.log(error.response.data);
            callback(0);
          }
    }

let baseHeaders = {
    'Authorization': "Bearer ",
    "Content-Type": `application/json`
};


const Main = async function () {
    fs.readFile('../books.txt', (codeErr, data) => {
        if (codeErr) throw codeErr;
        baseHeaders.Authorization += JSON.parse(data).access_token;

        reqConfig = axios.create({
            baseURL: 'https://www.worksapis.com/v1.0/',
            headers: baseHeaders,
            timeout: 3000
        });

        let newDate = new Date();
        newDate.setHours(newDate.getHours()+9);

        let dateString =newDate.toISOString().split('T')[0]
        fs.readFile(`../log/${dateString}.csv`,{encoding:"utf8"}, (csvErr, data) => {
            if (csvErr) throw csvErr;

            makeWriteNote(data).then( (res) =>{
                console.log(res);
            })


        })


    })

}
const makeWriteNote = function(data){
    return new Promise(function(resolve, reject) {
    let writeString=""
    for(let xi of data.split("\n").slice(1)){
        let outText = ""
        if(xi.split(",").length>4){
            get_users_email(xi.split(",")[3].trim(), (res)=>{
                if(res){
                    outText=xi.replace(xi.split(",")[3].trim(),`${res.email}(${res.name})`);
                    writeString+=`${outText}\n`;
                }
            });
        }
    }
    resolve(writeString);

});
}

Main();
