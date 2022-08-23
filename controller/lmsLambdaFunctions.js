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
        WHERE l.id=1
        GROUP BY id_module
      ) AS q)AS p;`

//       sql=`SELECT json_object(
//         lp1.name AS learning_path,
//       JSON_ARRAYAGG(
//          JSON_OBJECT(
//            'module', module,
//            'id_module', id_module,
//            'complexity', complexity
//          )
//    ) AS _result
//  FROM (
//    SELECT 
//    lp.name AS learning_path,
//      p.moduleid AS id_module,
//      m.name AS module,
//      JSON_ARRAYAGG(  
//        JSON_OBJECT(
//          'id_complexity', p.complexityid, 
//          'qncount', p.questionscount
//        )
//      ) AS complexity
//    FROM lms.learner l INNER JOIN lms.batch b ON ( l.batchid = b.id  )
//    INNER JOIN lms.batchmoduleconfig p ON ( b.id = p.batchid  )  
//    INNER JOIN lms.modules m ON ( m.id = p.moduleid  ) 
//    INNER JOIN lms.learningpath lp ON ( b.learningpathid = lp.id  ) 
//    WHERE l.id=1
//    GROUP BY id_module
//  ) AS p)
//  FROM lms.learningpath lp1 INNER JOIN  p ON ( P.learning_path = lp1.name );`
   connection.query(sql, function (err, result) {
        if (err) { console.error('error in executing query: ' + err.message);
          reject(dataObj);
        }
       // var result = result1.data;
        
       for (i in result)
      {
        //var resultArray = result[i]["_result"];
        var resultArray1 = result[i]["_data"]
        console.log("::::::"+JSON.stringify(resultArray1));
       
        var dataObj1 = JSON.parse(resultArray1);
        var resultArray = dataObj1["data"];
        console.log("()()()()"+resultArray);
      //   for (j in resultArray)
      // {
        
      //  // var resultArray = resultArray1[j]["data"];
        
      //   dataObj = JSON.parse(resultArray);
      //   dataObj.forEach(element => {
      //     // console.log("Reading module config...")
      //     // console.log(element);
      //   });
      // }
     }
      resolve(resultArray1);
    //resolve(result);
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
                console.log("&& fetchQuestionsPerModule QNS"+JSON.stringify(element1["data1"]))
                if(element1["data1"] != null){
                  console.log("+++++++ADDING QNS+++++++++");
                  var data1 = JSON.parse(element1["data1"]);
                  data1.forEach(element2 => {
                    element.questions.push(element2)
                  });
                  }
                //}
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
            const moduleConfig1 = await getModuleConfig();
            var dataObj1 = JSON.parse(moduleConfig1);
        var moduleConfig = dataObj1["data"];
            //console.log("!!!!!"+JSON.stringify(moduleConfig));
           //var moduleConfig = moduleConfig1["data"];
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
          console.log(err);
          reject(moduleConfig);
      }
    });
      
}

function assignQuestionToLearner(learnerid,complexityid,moduleid,qncount){
 return new Promise( (resolve, reject) => {
    var questions=[];   
    console.log("fetching questions...module: "+moduleid+" complexity "+complexityid+" qncount "+qncount)
  
    // sql=`SELECT * FROM question q, 
    // INNER JOIN solution s ON (s.questionid = q.id)
    // INNER JOIN languages l ON (s.languageid = l.id)
    // WHERE q.moduleid=`+moduleid+` and q.complexityid=`+complexityid+` and q.categoryid=1 and 
    // q.id NOT IN(SELECT questionid from learnerquestions where learnerid = `+learnerid+`)
    // ORDER BY RAND()
    // LIMIT `+qncount;

    sql=`SELECT JSON_ARRAYAGG(json_object('id',id1,'shortdesc',sd,'templatecode',templatecode) )as data1 FROM 
    (SELECT q.id as id1,q.shortdesc as sd , JSON_ARRAYAGG(JSON_OBJECT('langname',l.name,'langid',l.id,'code',s.templatecode )) as templatecode from question q 
        LEFT JOIN solution s ON (s.questionid = q.id)
        LEFT JOIN languages l ON (s.languageid = l.id)
    WHERE q.moduleid=`+moduleid+` and q.complexityid=`+complexityid+` and q.categoryid=1 and 
    q.id NOT IN(SELECT questionid from learnerquestions where learnerid = `+learnerid+`)
    group by id1 ORDER BY RAND()
    LIMIT `+qncount+`) as p`;

//     SELECT JSON_ARRAYAGG(json_object('id',id1,'shortdesc',sd,'templatecode',templatecode) )as data1 FROM 
// (SELECT q.id as id1,q.shortdesc as sd , JSON_ARRAYAGG(JSON_OBJECT('langname',l.name,'langid',l.id,'code',s.templatecode )) as templatecode from question q 
//     LEFT JOIN solution s ON (s.questionid = q.id)
//     LEFT JOIN languages l ON (s.languageid = l.id) WHERE q.moduleid=3 and q.complexityid=1 and q.categoryid=1 and 
//     q.id NOT IN(SELECT questionid from learnerquestions where learnerid = 1) group by id1 ORDER BY RAND() LIMIT 50 ) as p;


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
