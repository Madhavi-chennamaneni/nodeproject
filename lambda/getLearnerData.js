const mysql = require('mysql');

var counter=0;
var dbtojson = [];

var mainjson = {};

function assignQuestionsToLearner(learnerId) {
  // create the connection to database
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "lms"
  });
 // console.log("inside");

  connection.query(
    `SELECT  l.lastlogin, l1.questionid, l1.failureattempts, q.shortdesc, q.longdesc, q.templatecode, q.exampleinput, q.exampleoutput, m.name mname, l2.name lpname
        FROM lms.learner l 
            INNER JOIN lms.learnerquestions l1 ON ( l.id = l1.learnerid  )  
            INNER JOIN lms.question q ON ( l1.questionid = q.id  )  
            INNER JOIN lms.modules m ON ( q.moduleid = m.id  )  
            INNER JOIN lms.batchmoduleconfig b ON ( m.id = b.moduleid  )  
            INNER JOIN lms.batch b1 ON ( b.batchid = b1.id  )  
            INNER JOIN lms.learningpath l2 ON ( b1.learningpathid = l2.id  ) ` ,
    function (err, results, fields) {
      if (err) {
        console.log(err);
      }
      for (var i = 0; i < results.length; i++) {

        var tempquestion = {};
        var tempmodule = {};
        var templms = {};
        tempquestion.id = results[i].questionid;
        tempquestion.shortdesc = results[i].shortdesc;
        tempmodule.name = results[i].mname;
        tempmodule.questions = [];
        tempmodule.questions.push(tempquestion);
        templms.name = results[i].lpname;
        templms.modules = [];
        templms.modules.push(tempmodule);    
        buildJson(tempquestion.id, tempquestion, tempmodule.name, tempmodule, templms.name, templms);
      }
      console.log(dbtojson[0].modules[0].questions);
    }
    
  );
  connection.end()
}



function buildJson(tempquestionid, tempquestion, tempmodulename, tempmodule, templmsname, templms) {
  var lmsexists = 0, moduleexists = 0, questionexists = 0;

  for (var i = 0; i < dbtojson.length; i++) {
    console.log(counter++)
    if (dbtojson[i] && dbtojson[i].name && dbtojson[i].name === templmsname) {
      lmsexists = 1;
      for (var j = 0; j < dbtojson[i].modules.length; j++) {
        if (dbtojson[i].modules[j].name === tempmodulename) {
          moduleexists = 1;
          for (var k = 0; k < dbtojson[i].modules[j].questions.length; j++) {
            if (dbtojson[i].modules[j].questions[k].id === tempquestionid) {
              questionexists = 1;
              return true;
            }
          }
          if (questionexists == 0) {
            dbtojson[i].modules[j].questions.push(tempquestion);
          }
        }
      }
      if (moduleexists == 0) {
        dbtojson[i].modules.push(tempmodule);
      }
    }
  }
  if (lmsexists == 0) {

    dbtojson.push(templms);
  }

}




assignQuestionsToLearner(5);



function connection() {
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root"
  });

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });

}

// connection();