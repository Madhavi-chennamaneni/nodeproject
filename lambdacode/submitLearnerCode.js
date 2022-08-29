//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
let mysql = require('mysql');
const post = require('./post');

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'newuser',
  password: 'Pearl*1211',
  database: 'lms'
});

let body;
let statusCode = 200;
const headers = {
  "Content-Type": "application/json"
};

handler = async (event, context) => {
    try{
       // connectToLMS();
        //console.log("%%%%  event obj "+JSON.stringify(event));
        //TODO: CALL NODEJS FUNCTION
        var req={};
        req.body='{"code":"function main(a,b){var x=0; if(a.split(\'\').reverse().join(\'\')==a){ x=1;}if(x==1) {console.log(\'yes\');}else{console.log(\'no\');}}","language":"JavaScript","questionid":1,"custominput":"tlirilt"}';

        const finalRes = await post.submitUsercode(req);
        console.log("%%%%  FINAL  %%%%%"+JSON.stringify(finalRes));
        body=finalRes;
        //disconnectFromLMS();
    } catch (err) {
        statusCode = 400;
        body = err.message;
      } finally {
        body = JSON.stringify(body);
      }
    
      return {
        statusCode,
        body,
        headers
      };
    };
    
    event1 = {
      "learnerid":1,
      "complexityid":1,
      "moduleid":1,
      "qncount":2
    }
    handler(event1);