let mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'newuser',
    password: 'Pearl*1211',
    database: 'lms'
});

var dataObj=null;
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

async function getModuleConfig(learnerid){
    return new Promise( (resolve, reject) => {
      sql=`SELECT 
      JSON_ARRAYAGG(
         JSON_OBJECT(
           'module', module,
           'id_module', id_module,
           'complexity', complexity
         )
   ) AS _result
 FROM (
   SELECT 
     p.moduleid AS id_module,
     m.name AS module,
     JSON_ARRAYAGG(
       JSON_OBJECT(
         'id_complexity', p.complexityid, 
         'qncount', p.questionscount
       )
     ) AS complexity
   FROM lms.learner l INNER JOIN lms.batch b ON ( l.batchid = b.id  )
   INNER JOIN lms.batchmoduleconfig p ON ( b.id = p.batchid  )  
   INNER JOIN lms.modules m ON ( m.id = p.moduleid  )  
   WHERE l.id=1
   GROUP BY id_module
 ) AS p;`
   connection.query(sql, function (err, result) {
        if (err) { console.error('error in executing query: ' + err.message);
          reject(dataObj);
        }
       for (i in result)
      {
        var resultArray = result[i]["_result"];
        dataObj = JSON.parse(resultArray);
        dataObj.forEach(element => {
          // console.log("Reading module config...")
          // console.log(element);
        });
     }
      resolve(dataObj);
      });
    });
}


function fetchQuestionsPerModule(moduleid,complexityConfig,learnerid){
    return new Promise( (resolve, reject) => {
      try{
          return (async () => {
           
            for await (const element of complexityConfig) {
              element.questions=[];
              assignedquestions=await assignQuestionToLearner(learnerid,element.id_complexity,moduleid,element.qncount);
              assignedquestions.forEach(element1 => {
                console.log("&& fetchQuestionsPerModule QNS"+JSON.stringify(element1))

                element.questions.push(element1)
              });
              //complexityConfig.questions.push(assignedquestions);
            }
            console.log("&& fetchQuestionsPerModule RETURNING"+JSON.stringify(complexityConfig))
            resolve(complexityConfig);
          })();
      }
      catch(err){
        console.log(err);
        reject(err);
    }
  });
}

async function assignQuestionSetToLearner(learnerid,module){
    return new Promise( (resolve, reject) => {
      try{
          return (async () => {
            const moduleConfig = await getModuleConfig();
            for await (const element of moduleConfig) {
              var qnObj = await fetchQuestionsPerModule(element.id_module,element.complexity,learnerid);
              console.log("!!!!!"+JSON.stringify(qnObj));
              var resultObj = await insertQuestionSetInLearnerTable(learnerid,qnObj);
              console.log("#####"+JSON.stringify(resultObj));
            }
            console.log("$$$$"+JSON.stringify(moduleConfig));
            resolve(moduleConfig);
          })();   
      }
      catch(err){
          console.log(err);
          reject(moduleConfig);
      }
    });
      
}

function assignQuestionToLearner(learnerid,complexityid,moduleid,qncount){
 return new Promise( (resolve, reject) => {
    var questions=[];   
    console.log("fetching questions...module: "+moduleid+" complexity "+complexityid+" qncount "+qncount)
  
    sql=`SELECT * FROM question q 
    WHERE q.moduleid=`+moduleid+` and q.complexityid=`+complexityid+` and q.categoryid=1 and 
    q.id NOT IN(SELECT questionid from learnerquestions where learnerid = `+learnerid+`)
    ORDER BY RAND()
    LIMIT `+qncount;

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

function insertQuestionSetInLearnerTable(learnerid,complexityConfig){
  return new Promise( (resolve, reject) => {
    return (async () => {
    for await (const element1 of complexityConfig) {
    qnObj = element1.questions;
    qnObj.forEach(element => {
      sql="INSERT INTO learnerquestions(questionid,failureattempts,answer,score,learnerid) VALUES ("+element.id+","+0+","+null+","+0+","+learnerid+")";
      
      connection.query(sql, function (err, result) {
        if (err) { 
          console.error('error in executing query: ' + err.message);
          reject(err);
        }
        console.log("insertQuestionInLearnerTable:: Result"+JSON.stringify(result));
        resolve(result);
      })
    })
    resolve(complexityConfig);
  }
})(); 
  })

}

function insertQuestionsInLearnerTable(learnerid,qnsPerComplexityObj){
  return new Promise( (resolve, reject) => {
    qnObj = qnsPerComplexityObj.questions;
    qnObj.forEach(element => {
      sql="INSERT INTO learnerquestions(questionid,failureattempts,answer,score,learnerid) VALUES ("+element.id+","+0+","+null+","+0+","+learnerid+")";
      
      connection.query(sql, function (err, result) {
        if (err) { 
          console.error('error in executing query: ' + err.message);
          reject(err);
        }
        console.log("insertQuestionInLearnerTable:: Result"+JSON.stringify(result));
        resolve(result);
      })
    })
    resolve("No questions available to assign")
  })
}

function submitQuestionInLearnerTable(learnerid,questionid,answer,failureattempts,score){
  return new Promise( (resolve, reject) => {
   
      sql="UPDATE learnerquestions SET failureattempts="+failureattempts+",answer='"+answer+"',score="+score+
      " WHERE questionid="+questionid+" AND learnerid ="+ learnerid;
      
      connection.query(sql, function (err, result) {
        if (err) { 
          console.error('error in executing query: ' + err.message);
          reject(err);
        }
        console.log("submitQuestionInLearnerTable:: Result"+JSON.stringify(result));
        resolve(result);
      })
  })
}
//submitQuestionInLearnerTable(1,1,"DONE",1,0)
//getModuleConfig();
async function test(){
const finalRes = await assignQuestionSetToLearner(1);
console.log("%%%%  FINAL  %%%%%"+JSON.stringify(finalRes));
disconnectFromLMS();
}

test();
