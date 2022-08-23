

function uploadCandidatesCSVFile(req, res) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Uploads is the Upload_folder_name
            cb(null, __dirname)
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + ".csv")
        }
    })
    const maxSize = 1 * 1000 * 1000;
    var uploadCandidates = multer({
        storage: storage,
        limits: { fileSize: maxSize },
        fileFilter: function (req, file, cb) {
            var filetypes = /csv/;
            var mimetype = filetypes.test(file.mimetype);
            var extname = filetypes.test(path.extname(
                file.originalname).toLowerCase());
            if (mimetype && extname) {
                return cb(null, true);
            }
            cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
        }
    }).single('candidate');

    uploadCandidates(req, res, function (err) {
        if (err) {
            res.send(err);
        }
        else {
            readingCandidateCsvFile(req, res);
        }
    })
}

function readingCandidateCsvFile(req,res) {
    fs.readFile(CandidateCsvFileReadPath, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        else {
            lines = data.split("\n");
            checkDublicateForCandidateCSV(lines);
        }
    })
}

function checkDublicateForCandidateCSV(lines,req,res) {
    for (var i = 0; i < lines.length; i++) {
        let CandidateData={}        
        result="";
        isplit = lines[i].split(",");
        CandidateData.email=isplit[0];
        checkEmailfeild(isplit[0]);
        CandidateData.name=isplit[1];
        CandidateData.password=isplit[1];
        checkNameFeild(isplit[1]);
        CandidateData.phone=isplit[2];
        checkPhoneNumber(isplit[2]);
        CandidateData.group=isplit[3];

        if( (lines[i][lines[i].length - 1] == "\r") || (lines[i][lines[i].length - 1] == "\n")) {
            lines[i] = lines[i].substring(0, lines[i].length - 1);  
        }
        if(result.length>0)
        {
        lines[i]= lines[i]+","+result;
        }
        for (var j = i + 1; j < lines.length; j++) {
            
            jsplit = lines[j].split(",");  

                if (isplit[0] == jsplit[0]) {

                    if( (lines[j][lines[j].length - 1] == "\r") || (lines[j][lines[j].length - 1] == "\n")) {
                        lines[j] = lines[j].substring(0, lines[j].length - 1);
                    }
                    if( (lines[j][lines[j].length - 1] == ",") )
                    {
                    lines[j]=lines[j]+"dublicate email";
                    }
                    else{
                        lines[j]=lines[j]+",--dublicate email";
                    }
                }
        }      
    }
    writedata=lines.join("\n");
    writeProcessedCandidateCsvFile(writedata,req,res);
    
}

function writeProcessedCandidateCsvFile(writedata,req,res) {
    console.log(writedata);
    fs.writeFile(CandidateCsvfileWritePath, writedata, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Successfully Written to File.");
            
            readingProcessedCandidateFile(req,res);
        }
    });
}

function readingProcessedCandidateFile(req,res)
{
    fs.readFile(CandidateCsvfileWritePath, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        else {
            lines = data.split("\n");
            writeToDatabase(lines,req,res);             
        }
    })   
}

function writeToDatabase(lines,req,res)
{
    let CandidateData={}; 
    for(var i=0;i<lines.length;i++)
    {
    let randompassword = generatePassword(10);
    let hashedpassword = sha3_api(randompassword);
    isplit = lines[i].split(",");
    CandidateData.email=isplit[0];   
    CandidateData.name=isplit[1];
    CandidateData.password=hashedpassword;
    CandidateData.phone=isplit[2];
    CandidateData.group=isplit[3];
    if(isplit.length==4)
    {
    models.candidate.create(CandidateData).catch((result)=>{console.log(result)});    
    }
    else{
        console.log("error in entries");
    }
    }    
}

function checkEmailfeild(emailtext) {
    var email = emailtext;
    var filter = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!filter.test(email)) {
        result=result+ " email not in correct format--";
    }
}

function checkNameFeild(nametext) {
    var name = nametext;
    var filter = /^[a-zA-Z]*$/;
    if (!filter.test(name)) {
        result=result + " enter only alplabits in name feildS--";
    }
}

function checkPhoneNumber(phonetext) {
    var name = phonetext;
    if (name.length == 10) {
        var filter = /^[0-9\s]+$/;
        if (!filter.test(name)) {
            result=result + " enter only numbers in name feildS--";
        }
    }
    else{
    result=result + " Number of digits in phone number is not 10--";
    }
}

let CandidateCsvFileReadPath = (path.join(__dirname + "/candidate.csv"));
let CandidateCsvfileWritePath = (path.join(__dirname + "/candidateprocessed.csv"));

let saveCandidateviacsv = ((req, res) => {
    uploadCandidatesCSVFile(req, res);
    res.download(CandidateCsvfileWritePath,"candidates_entries_processed.csv");
    


})


module.exports = {
    saveCandidateviacsv: saveCandidateviacsv}