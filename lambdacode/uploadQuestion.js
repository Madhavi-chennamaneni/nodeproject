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
        req.body='{"qdata":{"id":"101","category":1,"autoevaluate":"no","module":"2","result":"","success":true,"shortdesc":"String Palindrome ","longdesc":"Write the pseudocode for String palindrome","exampleinput":"oppohockeyliril","exampleoutput":"yesnoyes","complexity":"1","autoevaluate":"1","maxtime":"10","marks":"5"},"qcodes":{"JavaScript":{"language":1,"boilerplatecode":"function main(a,b) {      //start your code here        }","solutioncode":"function main(a,b) {var x=0;    if(a.split(\'\').reverse().join(\'\')==a) {     x=1; }      if(x==1) {console.log(\'yes\');}else{console.log(\'no\');}}","executioncode":"function call() {main(process.argv[2],process.argv[3])   } call();"}},"io":[{"id":"8rIXuYPsqJkcSX3eZfjDu","input":"oppo","output":"yes"},{"id":"b9fqOkH9g0KawF907Uq25","input":"quick","output":"no"},{"id":"vvg8dq1_KqjMOhIAo8Xe4","input":"India","output":"no"},{"id":"bFUdV_j_J4g4NyTub0VbN","input":"liril","output":"yes"}]}';
         const finalRes = await post.savequestion(req);
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