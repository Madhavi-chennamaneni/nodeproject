const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
var childProcess = require('child_process');
const fetch = require('node-fetch');
var mysql = require('mysql');
//import fetch from 'node-fetch';



let runjavascript=(req, res) => {
	console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    
	var data = JSON.parse(req.body).code;
    //console.log(typeof(data));
    //var data=req.body.code;
	fs.writeFile("code.txt", data, (err) => {
		if (err) {
			console.log(err);
			res.end(JSON.stringify({ "body": "Error at server, please report to moderator" }));
		}
		else {
			childProcess.execFile('node', ["code.txt"], function (err, stdout, stderr) {
				if (err) {
					// handle err
					//fs.unlinkSync("code.txt");
					res.end(JSON.stringify({ "body": err.toString() }));
				}
				else if (stdout) {
					//fs.unlinkSync("code.txt");
					res.end(JSON.stringify({ "body": stdout.toString() }));
				}
				else {
					//fs.unlinkSync("code.txt");
					res.end(JSON.stringify({ "body": stderr.toString() }));
				}
			});
		}
		fs.unlinkSync("code.txt");
	});

}


let savequestion= (req, res) => {
	// var data = JSON.parse(req.body).code+'function call()\n{\nmain(parseInt(process.argv[2]),parseInt(process.argv[3]))\n}\ncall();';
	// var cas="10,20=30\n20,20=40\n";
	// var cases=cas.split("\n");

	console.log("api hit");
	console.log(req.body);
	var parsed = JSON.parse(req.body);
	var data = parsed.oursolution + parsed.executioncode;
	

	if (parsed.testcaseio.split("\n").length > 1) {

    //   if(true){

		var cases = parsed.testcaseio.split("\n");
		getResult(data, cases).then((response) => {
			res.end(JSON.stringify({ "body": response,"result":"success" }));			
		}).catch((error) => {			
			res.end(JSON.stringify({ "body": error.toString() }));
		})
	}
	else {
		res.end(JSON.stringify({ "body": error.toString() }));
	}

}



async function getResult(data, cases) {

	return new Promise((resolve, reject) => {
		PromiseRespCount = 0;
		for (var i = 0; i < cases.length - 1; i++) {
			var input = (cases[i].split("="))[0];
			var output = (cases[i].split("="))[1];
			var inputstrarr = input.split(',');
			var args = ["code.txt", ...inputstrarr];
			cheeckTestCases(data, args, output).then((response) => {
				
				//count++; 
				if (PromiseRespCount == cases.length - 2) {
					fs.unlinkSync("code.txt");
					resolve("Questions passed test cases and has been added to DB");
				}
				PromiseRespCount++;
			}).catch((error) => {
				reject(error);	
			})
		}
	})
}





async function cheeckTestCases(data, args, output) {

	return new Promise((resolve, reject) => {
		fs.writeFile(args[0], data, (err) => {
			if (err) {
				console.log(err);
				//res.end(JSON.stringify({ "body":"Error at server, please report to moderator"}));
				return false;
			}
			else {
				childProcess.execFile('node', args, function (err, stdout, stderr) {
					if (err) {
						console.log(err);
						reject("There are errors in the questions data");
					}
					else if (stdout) {
						if (stdout.replace(/\n/g, '') == output) {
							//
							resolve(stdout);
						}
						else {
							reject("Results mismatch for output " + output);
						}
					}
					else {
						console.log(stderr);
						reject("There are errors in the questions data");
					}
				});
			}
		});

	})
}


let verifyusercode=(req, res) => {
	var usercode="get from user"
	var UserQuestionId="get from api";
	var OurTestCasesArray="get from api";
	
	var data = JSON.parse(req.body).code+'function call()\n{\nmain(parseInt(process.argv[2]),parseInt(process.argv[3]))\n}\ncall();';
	var cas="10,20=30\n20,20=40\n";
	var cases=cas.split("\n");

	console.log("api hit");
	console.log(req.body);
	//process(req.body,res)
	//console.log(req.body);
	//var parsed = JSON.parse(req.body);
	//var parsed=JSON.parse(reqcode);
	//var data = parsed.oursolution + parsed.executioncode;
	

	//if (parsed.testcaseio.split("\n").length > 1) {


		//var cases = parsed.testcaseio.split("\n");
		getResult(data, cases).then((response) => {
			res.end(JSON.stringify({ "body": response,"result":"success" }));			
		}).catch((error) => {			
			res.end(JSON.stringify({ "body": error.toString() }));
		})
}


module.exports={
    runjavascript,runjavascript,
    savequestion:savequestion,
    verifyusercode:verifyusercode
}