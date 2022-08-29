let mysql = require('mysql');


// let connection = mysql.createConnection({
//     host: 'auroraserverlessv2-instance-1.cbpmrtq4vouy.ap-south-1.rds.amazonaws.com',
//     user: 'admin',
//     password: 'gradious1234',
//     database: 'lms'
// });
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'newuser',
  password: 'Pearl*1211',
  database: 'lms'
});

function connectToLMS(){
    connection.connect(function(err) {
        if (err) {
          return console.error('error: ' + err.message);
        }
      
        console.log('Connected to the MySQL server.');       
      });
}

function disconnectFromLMS(){
    connection.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
      });
}

function assignQuestionToLearner(learnerid,complexityid,moduleid,qncount){
    return new Promise( (resolve, reject) => {
       var questions=[];   
       console.log("fetching questions...module: "+moduleid+" complexity "+complexityid+" qncount "+qncount)
   
       sql=`SELECT JSON_ARRAYAGG(json_object('id',id1,'shortdesc',sd,'templatecode',templatecode) )as data1 FROM 
       (SELECT q.id as id1,q.shortdesc as sd , JSON_ARRAYAGG(JSON_OBJECT('langname',l.name,'langid',l.id,'code',s.templatecode )) as templatecode from question q 
           LEFT JOIN solution s ON (s.questionid = q.id)
           LEFT JOIN languages l ON (s.languageid = l.id)
       WHERE q.moduleid=`+moduleid+` and q.complexityid=`+complexityid+` and q.categoryid=1 and 
       q.id NOT IN(SELECT questionid from learnerquestions where learnerid = `+learnerid+`)
       group by id1 ORDER BY RAND()
       LIMIT `+qncount+`) as p`;
   
       connection.query(sql, function (err, result) {  
         if (err) { 
           console.error('error in executing query: ' + err.message);
           reject(err);
         }
         console.log("@@@@@@"+JSON.stringify(result));
         var resultArray = Object.values(JSON.parse(JSON.stringify(result)))
         resultArray.forEach(element1 => {
           questions.push(element1)
         });
         resolve(questions)
       });
     });
   }

   function insertQuestionsInLearnerTable(learnerid,qnsPerComplexityObj){
    return new Promise( (resolve, reject) => {
      try {
     // qnObj = qnsPerComplexityObj.questions;
     qnsPerComplexityObj.forEach(element => {
        sql="INSERT INTO learnerquestions(questionid,failureattempts,answer,score,learnerid) VALUES ("+element.id+","+0+","+null+","+0+","+learnerid+")";
        
        connection.query(sql, function (err, result) {
          if (err) { 
            console.error('error in executing query: ' + err.message);
            reject(err.message);
          }
          console.log("insertQuestionInLearnerTable:: Result"+JSON.stringify(result));
          resolve(result);
        })
      })
      resolve("No questions available to assign")
      }
        catch(err){
            console.log("insertQuestionsInLearnerTable"+err);
            reject(err.message);
        }
    })
  }
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//let assignQuestionToLearner = require('./common.js');
//require { assignQuestionToLearner,insertQuestionSetInLearnerTable } from './common.js';
//let assignQuestionToLearner = require('./common.js');
function replaceQuestionForLearner(learnerid,complexityid,moduleid,qncount){
  return new Promise( (resolve, reject) => {
    try{
        return (async () => {
            let questions=[];
            let assignedquestions=await assignQuestionToLearner(learnerid,complexityid,moduleid,qncount);
            assignedquestions.forEach(element1 => {
              console.log("&& replaceQuestionForLearner QNS"+JSON.stringify(element1["data1"]))
              if(element1["data1"] != null){
                console.log("+++++++ADDING QNS+++++++++");
                var data1 = JSON.parse(element1["data1"]);
                data1.forEach(element2 => {
                  questions.push(element2)
                });
                return (async () => {
                  console.log("+++++++ADDING questions+++++++++"+JSON.stringify(questions));
                var resultObj = await insertQuestionsInLearnerTable(learnerid,questions);
                console.log("#####"+JSON.stringify(resultObj));
              })();
                // else{
                //   //remove the complexity elemnt
                // }
              }
           });
          
          console.log("&& replaceQuestionForLearner RETURNING"+JSON.stringify(questions))
          resolve(questions);
        
        })();
    }
    catch(err){
      console.log("fetchQuestionsPerModule"+err);
      reject(err.message);
  }
});
}



  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

let handler = async (event, context) => {
try{
    //connectToLMS();
    console.log("%%%%  event obj "+JSON.stringify(event));
    finalRes = await replaceQuestionForLearner(event.learnerid,event.complexityid,event.moduleid,event.qncount);
    console.log("%%%%  FINAL  %%%%%"+JSON.stringify(finalRes));
    body=finalRes;
    disconnectFromLMS();
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

let event1 = {
  "learnerid":1,
  "complexityid":1,
  "moduleid":1,
  "qncount":2
}
handler(event1);



