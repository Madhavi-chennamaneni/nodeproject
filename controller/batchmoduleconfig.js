const path = require('path');
const fs = require('fs');
var mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lms'
});

function readingbatchmoduleconfigCsvFile(req, res, filename) {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        else {
            lines = data.split("\n");
            checkDublicateForbatchmoduleconfigCSV(req, res, lines);
        }
    })
}




function checkDublicateForbatchmoduleconfigCSV(req, res, lines) {

    var columns = lines[0].split(",").length;
    console.log(columns);
    for (var i = 0; i < lines.length; i++) {
        let batchmoduleconfig = {};
        result = "";
        isplit = lines[i].split(",");
        batchmoduleconfig.moduleid = isplit[0];
      //  checkNameFeild(isplit[0]);

      batchmoduleconfig.complexityid = isplit[1];
       // checkNameFeild(isplit[1]);

       batchmoduleconfig.questionscount = isplit[2];
        //checkNameFeild(isplit[2]);

        batchmoduleconfig.batchid = isplit[3];
       // checkNumber(isplit[3]);

       batchmoduleconfig.duedate = isplit[4];
       // checkNumber(isplit[3]);


        if ((lines[i][lines[i].length - 1] == "\r") || (lines[i][lines[i].length - 1] == "\n")) {
            lines[i] = lines[i].substring(0, lines[i].length - 1);
        }

        if (result.length > 0) {
            lines[i] = lines[i] + "," + result;
        }

        for (var j = i + 1; j < lines.length; j++) {

            jsplit = lines[j].split(",");

            if (isplit[0] == jsplit[0]) {

                if ((lines[j][lines[j].length - 1] == "\r") || (lines[j][lines[j].length - 1] == "\n")) {
                    lines[j] = lines[j].substring(0, lines[j].length - 1);
                }
                if ((lines[j][lines[j].length - 1] == ",")) {
                    lines[j] = lines[j] + " dublicate batchname";
                }
                else {
                    lines[j] = lines[j] + ", dublicate batchname";
                }
            }
        }

        if (lines[i].split(",").length == columns) {
            var candidatequery = `insert into lms.batchmoduleconfig (moduleid,complexityid,questionscount,batchid,duedate) values (` + parseInt(batchmoduleconfig.moduleid) + `,` + parseInt(batchmoduleconfig.complexityid) + `,` + parseInt(batchmoduleconfig.questionscount) + `,` + parseInt(batchmoduleconfig.batchid) + `,"` + batchmoduleconfig.duedate + `")`;
            connection.query(candidatequery, (err, result2) => {
                if (err) {
                    console.log(err);
                }
                console.log("db entry done");
            })

        }
    }
    writedata = lines.join("\n");
    writeProcessedBatchCsvFile(req, res, writedata);

}

function writeProcessedBatchCsvFile(req, res, writedata) {
    // console.log(res);
    fs.writeFile(BatchCsvfileWritePath, writedata, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            // res.download(CandidateCsvfileWritePath,"candidateprocessed.csv");
            console.log("Successfully Written to File.");

            res.download(BatchCsvfileWritePath, "batchprocessed.csv");
            // readingProcessedCandidateFile(req,res);
        }
    });
}

function readingProcessedCandidateFile(req, res) {
    fs.readFile(BatchCsvfileWritePath, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        else {
            lines = data.split("\n");
            writeToDatabase(lines, req, res);
        }
    })
}

function writeToDatabase(lines, req, res) {
    let CandidateData = {};
    for (var i = 0; i < lines.length; i++) {
        let randompassword = generatePassword(10);
        let hashedpassword = sha3_api(randompassword);
        isplit = lines[i].split(",");
        CandidateData.email = isplit[0];
        CandidateData.name = isplit[1];
        CandidateData.password = hashedpassword;
        CandidateData.phone = isplit[2];
        CandidateData.group = isplit[3];
        if (isplit.length == 4) {
            models.candidate.create(CandidateData).catch((result) => { console.log(result) });
        }
        else {
            console.log("error in entries");
        }
    }
}

function checkEmailfeild(emailtext) {
    var email = emailtext;
    var filter = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!filter.test(email)) {
        result = result + " email not in correct format--";
    }
}

function checkNameFeild(nametext) {
    var name = nametext;
    var filter = /^[a-zA-Z]*$/;
    if (!filter.test(name)) {
        result = result + " enter only alplabits in name feildS--";
    }
}

function checkPhoneNumber(phonetext) {
    var number = phonetext;
    if (number.length == 10) {
        var filter = /^[0-9\s]+$/;
        if (!filter.test(number)) {
            result = result + " enter only numbers in name feildS--";
        }
    }
    else {
        result = result + " Number of digits in phone number is not 10--";
    }
}

function checkNumber(phonetext) {
    var number = phonetext;
    var filter = /^[0-9\s]+$/;
    if (!filter.test(number)) {
        result = result + " enter only numbers in name feildS--";
    }

}


let CandidateCsvFileReadPath = (path.join(__dirname + "/candidate.csv"));
let BatchCsvfileWritePath = (path.join(__dirname + "/candidateprocessed.csv"));

let savebatchmoduleconfigviacsv = ((req, res, filename) => {
    readingbatchmoduleconfigCsvFile(req, res, filename);


})


module.exports = {
    savebatchmoduleconfigviacsv: savebatchmoduleconfigviacsv
}