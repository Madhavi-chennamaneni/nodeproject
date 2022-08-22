const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
var childProcess = require('child_process');
const fetch = require('node-fetch');
var mysql = require('mysql');
const { response } = require('../api');
const { resolve } = require('path');
//import fetch from 'node-fetch';

let connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'lms'
});

let runjavascript = (req, res) => {
	var data = JSON.parse(req.body).code;
	//console.log(typeof(data));
	//var data=req.body.code;
	console.log("api hit");
	runcode(req,res,data)
	// fs.writeFile("code.txt", data, (err) => {
	// 	if (err) {
	// 		console.log(err);
	// 		res.end(JSON.stringify({ "body": "Error at server, please report to moderator" }));
	// 	}
	// 	else {
	// 		childProcess.execFile('node', ["code.txt"], function (err, stdout, stderr) {
	// 			if (err) {
	// 				// handle err
	// 				//fs.unlinkSync("code.txt");
	// 				res.end(JSON.stringify({ "body": err.toString() }));
	// 			}
	// 			else if (stdout) {
	// 				console.log(stdout);
	// 				//fs.unlinkSync("code.txt");
	// 				res.end(JSON.stringify({ "body": stdout.toString() }));
	// 			}
	// 			else {
	// 				//fs.unlinkSync("code.txt");
	// 				res.end(JSON.stringify({ "body": stderr.toString() }));
	// 			}
	// 		});
	// 	}
	// 	//fs.unlinkSync("code.txt");
	// });

}


async function runcode(data,arguments)
{
	return new Promise((resolve,reject)=>{
	
	fs.writeFile("code.txt", data, (err) => {
		if (err) {
			console.log(err);
			res.end(JSON.stringify({ "body": "Error at server, please report to moderator" }));
		}
		else {
			childProcess.execFile('node', arguments, function (err, stdout, stderr) {
				if (err) {
					// handle err
					//fs.unlinkSync("code.txt");
					//res.end(JSON.stringify({ "body": err.toString() }));

					reject(err);

				}
				else if (stdout) {
					console.log(stdout);
					//fs.unlinkSync("code.txt");
					//res.end(JSON.stringify({ "body": stdout.toString() }));
					resolve(stdout);
				}
				else {
					//fs.unlinkSync("code.txt");
					//res.end(JSON.stringify({ "body": stderr.toString() }));
					reject(stderr);
				}
			});
		}
		//fs.unlinkSync("code.txt");
	});
})
}




function getJavascriptQuestionobject(questionsobject) {
	return questionsobject["JavaScript"];
}


let savequestion = (req, res) => {
	console.log("save hit");
	console.log(req.body);
	var Jsonrequest = JSON.parse(req.body);
	// console.log(Jsonrequest);
	var iodata = Jsonrequest.io;
	var dbentry = Jsonrequest.qdata;
	//var QuestionCodes = Object.values(Jsonrequest.qcodes)
	var QuestionCodes = getJavascriptQuestionobject(Jsonrequest.qcodes)
	var QuestionText = QuestionCodes.solutioncode + QuestionCodes.executioncode;

	var resultid;

	getResult(QuestionText, iodata).then((response) => {
		//let query = "INSERT INTO question (shortdesc,longdesc,categoryid,moduleid,templatecode,exampleinput,exampleoutput,complexityid,autoevaluate,marks,timelimit) VALUES (\"" + dbentry.shortdesc.toString() + "\",\"" + dbentry.longdesc + "\"," + parseInt(dbentry.category) + "," + parseInt(dbentry.module) + ",\"" + dbentry.longdesc + "\",\"" + dbentry.exampleinput + "\",\"" + dbentry.exampleoutput + "\"," + parseInt(dbentry.complexity) + "," + parseInt(dbentry.autoevaluate) + "," + parseInt(dbentry.marks) + "," + parseInt(dbentry.maxtime) + ");"
		let query = `INSERT INTO question (shortdesc,longdesc,categoryid,moduleid,templatecode,exampleinput,exampleoutput,complexityid,autoevaluate,marks,timelimit) VALUES (` + JSON.stringify(dbentry.shortdesc) + `,` + JSON.stringify(dbentry.longdesc) + `,` + parseInt(dbentry.category) + `,` + parseInt(dbentry.module) + `,` + JSON.stringify(dbentry.longdesc) + `,` + JSON.stringify(dbentry.exampleinput) + `,` + JSON.stringify(dbentry.exampleoutput) + `,` + parseInt(dbentry.complexity) + `,` + parseInt(dbentry.autoevaluate) + `,` + parseInt(dbentry.marks) + `,` + parseInt(dbentry.maxtime) + `)`;

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

		res.end(JSON.stringify({ "body": response, "result": "success" }));
	}).catch((error) => {
		res.end(JSON.stringify({ "body": error.toString() }));
	})
}



async function getResult(data, cases) {
		return new Promise((resolve, reject) => {
		PromiseRespCount = 0;
		for (var i = 0; i < cases.length; i++) {
			var input = (cases[i].input);
			var output = cases[i].output;
			// var inputstrarr = input.split('<>');
			// var args = ["code.txt", ...inputstrarr];

			var args=buildargs(input);
			runcode(data, args, output).then((response) => {
				if (PromiseRespCount == cases.length - 1) {
					fs.unlinkSync("code.txt");
					resolve(response);
				}
				PromiseRespCount++;
			}).catch((error) => {
				reject(error);
			})
		}
	})
}


function buildargs(inputstrarr)
{
	var inputstrarray = inputstrarr.split('<>');
			var args = ["code.txt", ...inputstrarray];

			return inputstrarray;
}



// async function cheeckTestCases(data, args, output) {

// 	return new Promise((resolve, reject) => {
// 		fs.writeFile(args[0], data, (err) => {
// 			if (err) {
// 				console.log(err);
// 				//res.end(JSON.stringify({ "body":"Error at server, please report to moderator"}));
// 				return false;
// 			}
// 			else {
// 				childProcess.execFile('node', args, function (err, stdout, stderr) {
// 					if (err) {
// 						console.log(err);
// 						reject(stderr);
// 					}
// 					else if (stdout) {
// 						if (stdout.replace(/\n/g, '') == output) {
							
// 							resolve(stdout);
// 						}
// 						else {
// 							reject( stdout);
// 						}
// 					}
// 					else {
// 						console.log(stderr);
// 						reject(stderr);
// 					}
// 				});
// 			}
// 		});

// 	})
// }








let verifyusercode = (req, res) => {
	var ParsedRequest = JSON.parse(req.body)
	console.log(ParsedRequest);
	var usercode = ParsedRequest.code;
	let testcasequery = `select * from testcases where questionid=` + ParsedRequest.questionid;

	var custominput=ParsedRequest.custominput;

	connection.query(testcasequery, (err, result2) => {
		if (err) {
			console.log(err);
		}

		console.log(result2);

		let executioncodequery = `select * from solution where questionid=` + ParsedRequest.questionid;
		connection.query(executioncodequery, (err, result3) => {
			if (err) {
				console.log(err);
			}
			console.log(result3);

			var executioncode = result3[0].executioncode;
			var questiondata = usercode + executioncode;

			var arguments=buildargs(custominput);

			runcode(req,res,questiondata,arguments)

			getResult(questiondata, result2).then((response) => {
				
				res.end(JSON.stringify({ "body": response, "result": "success" }));

				runcode(req,res,questiondata);
				//calculate score

				/* enable on success

				var score = calculatescore();
				var learnerid = 1;
				let learnerquestionsquery = `insert into learnerquestions(answer,score) values("` + usercode + `",` + score + `) where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result2) => {
					if (err) {
						console.log(err);
					}

				})
				*/

			}).catch((error) => {
				res.end(JSON.stringify({ "body": error, "result": "success"}));
				console.log("%%%%%%%%%%%%%%%%%%%%%%%"+error);

				/* enable on failure

				var score = calculatescore();
				let learnerquestionsquery = `insert into learnerquestions(answer,score) values("` + usercode + `",` + score + `) where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result2) => {
					if (err) {
						console.log(err);
					}
				})

				let failureupdate = `insert into learnerquestions set failureattempts=failureattempts+1 where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(failureupdate, (err, result2) => {
					if (err) {
						console.log(err);
					}

				})

				*/

			})

		})

		//  res.json(result2);
	})


}



let uploads = (req, res) => {
	console.log("upload api hit");
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var oldpath = files.file.filepath;
		var newpath = './' + files.file.originalFilename;
		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err;
			res.write('File uploaded and moved!');
			res.end();
		})
		console.log(fields);
		console.log(files.file)
	})
}

module.exports = {
	runjavascript, runjavascript,
	savequestion: savequestion,
	verifyusercode: verifyusercode,
	uploads: uploads
}