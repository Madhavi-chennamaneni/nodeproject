const fs = require('fs');
var childProcess = require('child_process');

async function runJavaScriptCode(req, res, data, arguments, output) {
	var args = arguments;
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
						if (output != undefined) {
							if (stdout.replace(/\n/g, '') == output) {
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
	var inputstrarray = inputstrarr.split('<>');
	var args = ["code.txt", ...inputstrarray];
	return args;
}


module.exports = {
	runJavaScriptCode, runJavaScriptCode,
    buildargs:buildargs
}