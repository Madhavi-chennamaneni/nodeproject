const fs = require('fs');
//const path = require('path');
//const formidable = require('formidable');
//var childProcess = require('child_process');
//const fetch = require('node-fetch');
var mysql = require('mysql');
//const { response } = require('../api');
//const { resolve } = require('path');
//import fetch from 'node-fetch';
const utils = require('./utils');


let connection = mysql.createConnection({
	host: 'localhost',
	user: 'newuser',
	password: 'Pearl*1211',
	database: 'lms'
});




function getJavascriptQuestionobject(questionsobject) {
	return questionsobject["JavaScript"];
}


let savequestion = (req, res) => {
	return new Promise( (resolve, reject) => {
		try {
	//console.log("save hit");
	console.log(req.body);
	var Jsonrequest = JSON.parse(req.body);
	console.log('after parsing');
	//console.log(Jsonrequest);
	var iodata = Jsonrequest.io;
	var dbentry = Jsonrequest.qdata;
	//var QuestionCodes = Object.values(Jsonrequest.qcodes)
	var QuestionCodes = getJavascriptQuestionobject(Jsonrequest.qcodes);
	var QuestionText = QuestionCodes.solutioncode + QuestionCodes.executioncode;
	console.log("@@@@@@@@@@@iodata"+iodata);
	var resultid;
	return (async () => {
	checkTestCases(req, res, QuestionText, iodata).then((response) => {

		//	res.end(json.stringify({"body":response, "result":"success"}));
		//let query = "INSERT INTO question (shortdesc,longdesc,categoryid,moduleid,templatecode,exampleinput,exampleoutput,complexityid,autoevaluate,marks,timelimit) VALUES (\"" + dbentry.shortdesc.toString() + "\",\"" + dbentry.longdesc + "\"," + parseInt(dbentry.category) + "," + parseInt(dbentry.module) + ",\"" + dbentry.longdesc + "\",\"" + dbentry.exampleinput + "\",\"" + dbentry.exampleoutput + "\"," + parseInt(dbentry.complexity) + "," + parseInt(dbentry.autoevaluate) + "," + parseInt(dbentry.marks) + "," + parseInt(dbentry.maxtime) + ");"
		let query = `INSERT INTO question (shortdesc,longdesc,categoryid,moduleid,templatecode,exampleinput,exampleoutput,complexityid,autoevaluate,marks,timelimit) VALUES (` +JSON.stringify(dbentry.shortdesc) + `,` + JSON.stringify(dbentry.longdesc) + `,` + parseInt(dbentry.category) + `,` + parseInt(dbentry.module) + `,` + JSON.stringify(dbentry.longdesc) + `,` + JSON.stringify(dbentry.exampleinput) + `,` + JSON.stringify(dbentry.exampleoutput) + `,` + parseInt(dbentry.complexity) + `,` + parseInt(dbentry.autoevaluate) + `,` + parseInt(dbentry.marks) + `,` + parseInt(dbentry.maxtime) + `)`;

		connection.query(query, (err, result) => {
			if (err) {
				//reject(res.end(JSON.stringify({ "body": err.toString() })));
				console.log(err);
			}
			resultid = result.insertId;
			//let solutionquery = "INSERT INTO solution(questionid,languageid,templatecode,solutioncode,executioncode) values (" + resultid + "," + QuestionCodes.language + ",\"" + QuestionCodes.boilerplatecode + "\",\"" + QuestionCodes.solutioncode + "\",\"" + QuestionCodes.executioncode + "\")";

			let solutionquery = `INSERT INTO solution(questionid,languageid,templatecode,solutioncode,executioncode) values (` + resultid + `,` + QuestionCodes.language + `,` + JSON.stringify(QuestionCodes.boilerplatecode) + `,` + JSON.stringify(QuestionCodes.solutioncode) + `,` + JSON.stringify(QuestionCodes.executioncode) + `)`;
			console.log(solutionquery);
			connection.query(solutionquery, (err, result1) => {
				if (err) {
					//reject(res.end(JSON.stringify({ "body": err.toString() })));
					console.log(err);
				}
				for (var i = 0; i < Jsonrequest.io.length; i++) {
					// let testcasequery = "INSERT INTO testcases(questionid,input,output) values (" + resultid + ",\"" + Jsonrequest.io[i].input + "\",\"" + Jsonrequest.io[i].output + "\")";
					let testcasequery = `INSERT INTO testcases(questionid,input,output) values (` + resultid + `,` + JSON.stringify(Jsonrequest.io[i].input) + `,` + JSON.stringify(Jsonrequest.io[i].output) + `)`;


					connection.query(testcasequery, (err, result2) => {
						if (err) {
							//reject(res.end(JSON.stringify({ "body": err.toString() })));
							console.log(err);
						}
					})
				}
			})
		})

		var resStr = JSON.stringify({ "body": response, "result": "success" })
		resolve(resStr);
		//res.end(resStr);
	}).catch((error) => {
		var errStr = JSON.stringify({ "body": error.toString() })
		//res.end(errStr);
		reject(errStr);
	})
})();
		}
		catch(err){console.log("error"+err)
		reject(err.message)}
});
}



async function checkTestCases(req, res, data, cases) {
	return new Promise((resolve, reject) => {
		console.log("checkTestCases");
		PromiseRespCount = 0;
		for (var i = 0; i < cases.length; i++) {
			console.log("checkTestCases...case"+cases[i]);
			var input = (cases[i].input);
			var output = cases[i].output;
			var args = buildargs(input);
			utils.runJavaScriptCode(req, res, data, args, output).then((response) => {
				if (PromiseRespCount == cases.length - 1) {
					fs.unlinkSync("code.txt");
					console.log("checkTestCases....rrsolve");
					resolve("All test cases passed and question added to database");
				}
				PromiseRespCount++;
			}).catch((error) => {
				console.log("checkTestCases....reject"+error);
				reject("Testcase failed for input " + (args) + " and output " + output);
			})
		}
	})
}



function buildargs(inputstrarr) {
	var inputstrarray = inputstrarr.split('<>');
	var args = ["code.txt", ...inputstrarray];
	return args;
}




let submitUsercode = (req, res) => {
	return new Promise( (resolve, reject) => {
	var ParsedRequest = JSON.parse(req.body);
	console.log(ParsedRequest);
	var usercode = ParsedRequest.code;
	var custominput = ParsedRequest.custominput;

	let executioncodequery = `select * from solution where questionid=` + ParsedRequest.questionid;
	connection.query(executioncodequery, (err, result3) => {
		if (err) {
			console.log(err);
		}
		var executioncode = result3[0].executioncode;
		var usercodetext = usercode + executioncode;
		var args = utils.buildargs(custominput);

		utils.runJavaScriptCode(req, res, usercodetext, args).then((response) => {
			//res.end(JSON.stringify({ "body": response.toString(), "result": "success" }));
			res='{ "body": response.toString(), "result": "success" }';
		}).catch((error) => {
			//res.end(JSON.stringify({ "body": error.toString(), "result": "success" }));
			res='{ "body": error.toString(), "result": "success" }';
		})

	
		let testcasequery = `select * from testcases where questionid=` + ParsedRequest.questionid;
		connection.query(testcasequery, (err, result2) => {
			if (err) {
				console.log(err);
			}

			checkTestCases(req, res, usercodetext, result2).then((response) => {



				// enable on success

				//var score = calculatescore();
				// var learnerid = 1;
				let learnerquestionsquery = `update learnerquestions set answer=` + JSON.stringify(usercode) + `,score=10 WHERE learnerid=1 AND questionid=` + ParsedRequest.questionid;
				// let learnerquestionsquery = `INSERT INTO learnerquestions(answer,score) values(` + JSON.stringify(usercode) + `, 10 ) WHERE learnerid=1 AND questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result20) => {
					if (err) {
						console.log(err);
						reject(err);
					}
					resolve(result20)
				})


			}).catch((error) => {

				//  enable on failure

				// var score = calculatescore();
				let learnerquestionsquery = `update learnerquestions set answer=` + JSON.stringify(usercode) + `,score=10 WHERE learnerid=1 AND questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result2) => {
					if (err) {
						console.log(err);
						reject(err);
					}
					resolve(result2)

				})

				let failureupdate = `update learnerquestions set failureattempts=failureattempts+1 WHERE learnerid= 1 AND questionid=` + ParsedRequest.questionid;
				connection.query(failureupdate, (err, result2) => {
					if (err) {
						console.log(err);
						reject(err)
					}
					resolve(result2)

				})
			})
		})
		

	})
})
}



// let uploads = (req, res) => {
// 	console.log("upload api hit");
// 	var form = new formidable.IncomingForm();
// 	form.parse(req, function (err, fields, files) {
// 		var oldpath = files.file.filepath;
// 		var newpath = './' + files.file.originalFilename;
// 		fs.rename(oldpath, newpath, function (err) {
// 			if (err) throw err;
// 			res.write('File uploaded and moved!');
// 			res.end();
// 		})
// 		console.log(fields);
// 		console.log(files.file)
// 	})
// }

module.exports = {
	savequestion: savequestion,
	submitUsercode: submitUsercode
	//uploads: uploads,
}