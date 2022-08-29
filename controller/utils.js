const fs = require('fs');
var childProcess = require('child_process');
const candidate=require('./candidatesupload')


const candidateUploadCSV=candidate.candidateUploadCSV;

async function runJavaScriptCode(req, res, data, arguments, output) {
	var args = arguments;
    var output1=output;
	console.log(output);
	return new Promise((resolve, reject) => {

		fs.writeFile("code.txt", data, (err) => {
           
			if (err) {
				console.log(err);
				res.end(JSON.stringify({ "body": "Error at server, please report to moderator" }));
			}
			else {
				childProcess.execFile('node', arguments, function (err, stdout, stderr) {
					if (err) {
						reject(err);
					}
					else if (stdout) {
                        console.log("std output   "+stdout );
						if (output != undefined) {
							if (stdout.replace(/\n/g, '') == output1) {
								resolve(stdout);
                                //fs.unlink();
							}
							else {
								args.shift();
								res.end(JSON.stringify({ "body": "Testcase failed for input " + (args) + " and output " + output, "result": "success" }));
								reject(stdout);
							}
						}
						resolve(stdout);
					}
					else {
						reject(stderr);
					}
				});
			}
		});
	})
}


function buildargs(inputstrarr) {
	var inputstrarray = inputstrarr.split('\n');
	var args = ["code.txt", ...inputstrarray];
	return args;
}


module.exports = {
	runJavaScriptCode, runJavaScriptCode,
    buildargs:buildargs,
    candidateUploadCSV:candidateUploadCSV
    
}