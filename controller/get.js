var mysql = require('mysql');
const { get } = require('../api');

const utils = require('./utils');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lms'
});

let getlanguages= async (req,res)=>{
    return new Promise((resolve,reject)=>{
    console.log("languages hit");
    let query="select * from lms.languages";

    connection.query(query,(err, result)=>{
        if(err){
            reject(res.end(JSON.stringify({ "body": err.toString() })));
        }
        resolve( res.json(result));
    })
    
})

}

let getmodules= async (req,res)=>{
    return new Promise((resolve,reject)=>{
    
    console.log("modules hit");
    let query="select * from lms.modules";

    connection.query(query,(err, result)=>{
        if(err){
            reject(res.end(JSON.stringify({ "body": err.toString() })));
        }

        resolve( res.json(result));

    })
    
})

}

let getcomplexity= async (req,res)=>{
    return new Promise((resolve,reject)=>{

    
    console.log("languages hit");
    let query="select * from lms.complexity";

    connection.query(query,(err, result)=>{
        if(err){
            reject(res.end(JSON.stringify({ "body": err.toString() })));
        }

        resolve( res.json(result));

    })
    
})

}

let getquestions= async (req,res)=>{
    return new Promise((resolve,reject)=>{

    
    console.log("questions hit");
    let query="select * from lms.question";

    connection.query(query,(err, result)=>{
        if(err){
            reject(res.end(JSON.stringify({ "body": err.toString() })));
        }

        resolve( res.json(result));

    })
    
})

}



let runcode = async (req,res)=>{
// return new Promise((resolve,reject)=>{

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
			res.end(JSON.stringify({ "body": response.toString(), "result": "success" }));
		}).catch((error) => {
			res.end(JSON.stringify({ "body": error.toString(), "result": "success" }));
		})

    })
// })

}


module.exports={
    getlanguages:getlanguages,
    getcomplexity:getcomplexity,
    getmodules:getmodules,
    runcode:runcode,
    getquestions:getquestions
}