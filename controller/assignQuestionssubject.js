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
      //  connectToLMS();
   //sql=' SELECT   b1.moduleid, group_concat(b1.complexityid) as complexity, group_concat(b1.questionscount) as questions FROM lms.learner l INNER JOIN lms.batch b ON ( l.batchid = b.id  )  INNER JOIN lms.batchmoduleconfig b1 ON ( b.id = b1.batchid  )  WHERE l.id=1 group by b1.moduleid'
   //sql=' SELECT  JSON_OBJECT(\'Module\', b1.moduleid, \'Complexity\',group_concat(b1.complexityid), \'Qns\',group_concat(b1.questionscount)) as res FROM lms.learner l INNER JOIN lms.batch b ON ( l.batchid = b.id  )  INNER JOIN lms.batchmoduleconfig b1 ON ( b.id = b1.batchid  )  WHERE l.id=1 group by b1.moduleid'
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
       //console.log("Result: " +JSON.stringify(result));
       for (i in result)
{
   // console.log(result[i]["_result"]);
    var resultArray = result[i]["_result"];
    dataObj = JSON.parse(resultArray);
   // console.log(typeof dataObj)
    dataObj.forEach(element => {
       // console.log("Reading module config...")
       // console.log(element);
    });
}
resolve(dataObj);
       // var str = JSON.stringify(result);
       // var obj = JSON.parse(str);
       // console.log("Result OBJ moduleid: " + result[0].res);
       // console.log("Result OBJ complexity: " + result[0].res.Complexity);
        //console.log("Result OBJ questions: " + result[0].res.Qns);

       // disconnectFromLMS();
      });
    });
}

function fetchQuestionsPerModule(moduleid,complexityConfig,learnerid){
    return new Promise( (resolve, reject) => {
        //connectToLMS();
        complexityConfig.forEach(element => {
            console.log("Reading complexity config..."+moduleid+"  "+element.id_complexity+"  "+element.qncount)
           //console.log(element);
        
  sql=`SELECT * FROM question q 
  WHERE q.moduleid=`+moduleid+` and q.complexityid=`+element.id_complexity+` and q.categoryid=1 and 
  q.id NOT IN(SELECT questionid from learnerquestions where learnerid = `+learnerid+`)
  ORDER BY RAND()
  LIMIT `+element.qncount;

  connection.query(sql, function (err, result) {
    if (err) { console.error('error in executing query: ' + err.message);
    reject(dataObj);
    }
    //console.log(JSON.stringify(result));
    resolve(result)
    //disconnectFromLMS();
});
});
    });


}

async function assignQuestionSetToLearner(learnerid,module){
    return new Promise( (resolve, reject) => {
    try{
        return (async () => {
    const moduleConfig = await getModuleConfig();
    
   
        //console.log(moduleConfig);
       // await Promise.all(moduleConfig.map(async (element) => {
        //await moduleConfig.forEach(element => {
          for await (const element of moduleConfig) {
            //console.log("Reading module config..."+element.id_module+"  "+element.complexity)
           //console.log(element);
           element.questions=[];
          // return (async () => {
           var qnObj = await fetchQuestionsPerModule(element.id_module,element.complexity,learnerid);
           var resultArray = Object.values(JSON.parse(JSON.stringify(qnObj)))
          
          resultArray.forEach(element1 => {
            element.questions.push(element1)
           });
           //console.log(element);
       // })();
      //}));
       // });
      }
      // console.log("$$$$"+JSON.stringify(moduleConfig));
       resolve(moduleConfig);
    })();
        
    }
    catch(err){
        console.log(err);
        reject(moduleConfig);
    }
    });
      
}

function replaceQuestionToLearner(learnerid,complexity,module){

}

//getModuleConfig();
async function test(){
const finalRes = await assignQuestionSetToLearner(1);
console.log("$$$$"+JSON.stringify(finalRes));
}

test();