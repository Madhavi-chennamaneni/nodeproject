const path = require('path');
const fs = require('fs');
var mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lms'
});

function readingInstituteCsvFile(req, res, filename) {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        else {
            lines = data.split("\n");
            checkDublicateForInstituteCSV(req, res, lines);
        }
    })
}

function checkDublicateForInstituteCSV(req, res, lines) {

     var columns = lines[0].split(",").length;
    //console.log(columns);
    for (var i = 0; i < lines.length; i++) {
        let InstituteData = {};
        result = "";
        isplit = lines[i].split(",");
        InstituteData.name = isplit[0];
        console.log(isplit[0])
        // checkNameFeild(isplit[0]);

        InstituteData.location = isplit[1];
        // checkNameFeild(isplit[1]);

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
                    lines[j] = lines[j] + " dublicate institute";
                }
                else {
                    lines[j] = lines[j] + ", dublicate institute";
                }
            }
        }

        console.log(lines[i].split(",")+"      "+columns);
        if (lines[i].split(",").length == columns) {
            var institutequery = `insert into lms.institute (name,location) values("` + InstituteData.name + `","` + InstituteData.location +`")`;
            connection.query(institutequery, (err, result2) => {
                if (err) {
                    console.log(err);
                }
               // console.log(i+"     db entry done");
            })

        }
    }
     writedata = lines.join("\n");
     writeProcessedCandidateCsvFile(req, res, writedata);

}

function writeProcessedCandidateCsvFile(req, res, writedata) {
    // console.log(res);
    fs.writeFile(CandidateCsvfileWritePath, writedata, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            // res.download(CandidateCsvfileWritePath,"candidateprocessed.csv");
            console.log("Successfully Written to File.");

            res.download(CandidateCsvfileWritePath, "instituteprocessed.csv");
            // readingProcessedCandidateFile(req,res);
        }
    });
}

// function readingProcessedCandidateFile(req, res) {
//     fs.readFile(CandidateCsvfileWritePath, 'utf8', function (err, data) {
//         if (err) {
//             console.error(err);
//             return;
//         }
//         else {
//             lines = data.split("\n");
//             writeToDatabase(lines, req, res);
//         }
//     })
// }

// function writeToDatabase(lines, req, res) {
//     let CandidateData = {};
//     for (var i = 0; i < lines.length; i++) {
//         let randompassword = generatePassword(10);
//         let hashedpassword = sha3_api(randompassword);
//         isplit = lines[i].split(",");
//         CandidateData.email = isplit[0];
//         CandidateData.name = isplit[1];
//         CandidateData.password = hashedpassword;
//         CandidateData.phone = isplit[2];
//         CandidateData.group = isplit[3];
//         if (isplit.length == 4) {
//             models.candidate.create(CandidateData).catch((result) => { console.log(result) });
//         }
//         else {
//             console.log("error in entries");
//         }
//     }
// }

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

// let CandidateCsvFileReadPath = (path.join(__dirname + "/institute.csv"));
let CandidateCsvfileWritePath = (path.join(__dirname + "/instituteprocessed.csv"));


let saveInstituteviacsv = ((req, res, filename) => {
    readingInstituteCsvFile(req, res, filename);


})


module.exports = {
    saveCandidateviacsv: saveInstituteviacsv
}