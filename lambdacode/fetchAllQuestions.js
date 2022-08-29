let mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'auroraserverlessv2-instance-1.cbpmrtq4vouy.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'gradious1234',
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
      try {
      sql=`SELECT JSON_OBJECT( 'learning_path',  'FullStack',
      'data', _result) AS _data FROM (SELECT 
           JSON_ARRAYAGG(
              JSON_OBJECT(
                'module', module,
                'id_module', id_module,
                'complexity', complexity
              )
        ) AS _result
      FROM (
        SELECT 
        lp.name AS learning_path,
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
        INNER JOIN lms.learningpath lp ON ( b.learningpathid = lp.id  ) 
        WHERE l.id=`+learnerid+` GROUP BY id_module
      ) AS q)AS p;`


   connection.query(sql, function (err, result) {
        if (err) { console.error('error in executing query: ' + err.message);
          reject(err.messag);
        }        
       for (i in result)
      {
        var resultArray1 = result[i]["_data"]
        console.log("::::::"+JSON.stringify(resultArray1));
       
        var dataObj1 = JSON.parse(resultArray1);
        var resultArray = dataObj1["data"];
        console.log("()()()()"+resultArray);
         if(resultArray == null){
          reject("No config data found for the learner");
        }
    
     }
      resolve(resultArray1);
      });
      }
      catch(err){
        console.log("getModuleConfig"+err);
        reject(err.message);
    }
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
                console.log("&& fetchQuestionsPerModule QNS"+JSON.stringify(element1["data1"]))
                if(element1["data1"] != null){
                  console.log("+++++++ADDING QNS+++++++++");
                  var data1 = JSON.parse(element1["data1"]);
                  data1.forEach(element2 => {
                    element.questions.push(element2)
                  });
                  }
                  else{
                    //remove the complexity elemnt
                  }
              });
            }
            console.log("&& fetchQuestionsPerModule RETURNING"+JSON.stringify(complexityConfig))
            resolve(complexityConfig);
          })();
      }
      catch(err){
        console.log("fetchQuestionsPerModule"+err);
        reject(err.message);
    }
  });
}

async function assignQuestionSetToLearner(learnerid,module){
    return new Promise( (resolve, reject) => {
      try{
          return (async () => {
            const moduleConfig1 = await getModuleConfig(learnerid);
            var dataObj1 = JSON.parse(moduleConfig1);
        var moduleConfig = dataObj1["data"];
            for await (const element of moduleConfig) {
              var qnObj = await fetchQuestionsPerModule(element.id_module,element.complexity,learnerid);
              console.log("!!!!!"+JSON.stringify(qnObj));
              var resultObj = await insertQuestionSetInLearnerTable(learnerid,qnObj);
              console.log("#####"+JSON.stringify(resultObj));
            }
            console.log("$$$$"+JSON.stringify(moduleConfig));
            resolve(dataObj1);
          })();   
      }
      catch(err){
          console.log("assignQuestionSetToLearner"+err);
          reject(err.message);
      }
    });
      
}

function assignQuestionToLearner(learnerid,complexityid,moduleid,qncount){
 return new Promise( (resolve, reject) => {
    try{
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
        reject(err.message);
      }
      console.log("@@@@@@"+JSON.stringify(result));
      var resultArray = Object.values(JSON.parse(JSON.stringify(result)))
      resultArray.forEach(element1 => {
        questions.push(element1)
      });
      resolve(questions)
    });
    }
      catch(err){
          console.log("assignQuestionToLearner"+err);
          reject(err.message);
      }
  });
}

function insertQuestionSetInLearnerTable(learnerid,complexityConfig){
  return new Promise( (resolve, reject) => {
    try {
    return (async () => {
    for await (const element1 of complexityConfig) {
    qnObj = element1.questions;
    qnObj.forEach(element => {
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
    resolve(complexityConfig);
  }
})(); 
}
      catch(err){
          console.log("insertQuestionSetInLearnerTable"+err);
          reject(err.message);
      }
  })

}

function insertQuestionsInLearnerTable(learnerid,qnsPerComplexityObj){
  return new Promise( (resolve, reject) => {
    try {
    qnObj = qnsPerComplexityObj.questions;
    qnObj.forEach(element => {
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

function submitQuestionInLearnerTable(learnerid,questionid,answer,failureattempts,score){
  return new Promise( (resolve, reject) => {
   try {
      sql="UPDATE learnerquestions SET failureattempts="+failureattempts+",answer='"+answer+"',score="+score+
      " WHERE questionid="+questionid+" AND learnerid ="+ learnerid;
      
      connection.query(sql, function (err, result) {
        if (err) { 
          console.error('error in executing query: ' + err.message);
          reject(err.message);
        }
        console.log("submitQuestionInLearnerTable:: Result"+JSON.stringify(result));
        resolve(result);
      })
  }
      catch(err){
          console.log("submitQuestionInLearnerTable"+err);
          reject(err.message);
      }
  })
}

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

exports.handler = async (event, context) => {
try{
    connectToLMS();
    console.log("%%%%  event.routeKey"+event.routeKey);
    const finalRes = await assignQuestionSetToLearner(event.routeKey);
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



