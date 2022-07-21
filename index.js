const express = require('express');
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');

const app = express();

app.post('/api/upload', (req, res, next) => {
    console.log("api hittt")
	
	const form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){

        //console.log(req);
        //console.log(files);
       // console.log(files.file.filepath+"           "+files.file.originalFilename);
        console.log(req);

		var oldPath = files.file.filepath;
		var newPath = path.join(__dirname, 'uploads')
        + '/'+files.file.originalFilename;
		var rawData = fs.readFileSync(oldPath)
	
		fs.writeFile(newPath, rawData, function(err){
			if(err) console.log(err)
			return res.send("Successfully uploaded")
		})
})


});

app.listen(3005, function(err){
	if(err) console.log(err)
	console.log('Server listening on Port 300s');
});
