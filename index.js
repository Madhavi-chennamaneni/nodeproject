const express = require('express');
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
var childProcess = require('child_process');

const app = express();

app.use(express.text())
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	next();

})

app.post('/api/javascript', (req, res) => {
	var data = JSON.parse(req.body).code;
	fs.writeFile("code.txt", data, (err) => {
		if (err)
		{
			console.log(err);
			res.end(JSON.stringify({ "body":"Error at server, please report to moderator"}));
		}
		else {
				childProcess.execFile('node', ["code.txt"], function (err, stdout, stderr) {
					if (err) {
						// handle err
						res.end(JSON.stringify({ "body": err.toString() }));
					}
					else if (stdout) {
						res.end(JSON.stringify({ "body": stdout.toString() }));
					}
					else  {						
							res.end(JSON.stringify({ "body": stderr.toString() }));
					}
				});
		}
		//fs.unlinkSync("code.txt");
	});

})


app.listen(3005, function (err) {
	//if(err) console.log(err)
	console.log('Server listening on Port 300s');
});
