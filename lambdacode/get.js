var mysql = require('mysql');
//const { get } = require('../api');

const utils = require('./utils');

let connection = mysql.createConnection({
	host: 'localhost',
	user: 'newuser',
	password: 'Pearl*1211',
	database: 'lms'
});

let getlanguages= async (req,res)=>{
    return new Promise((resolve,reject)=>{
    console.log("languages hit");
    let query="select * from lms.languages";

    connection.query(query,(err, result)=>{
        if(err){
            //reject(res.end(JSON.stringify({ "body": err.toString() })));
            reject('{ "body": err.toString() }');
        }
        //resolve( res.json(result));
        resolve( result);
    })
    
})

}

let getmodules= async (req,res)=>{
    return new Promise((resolve,reject)=>{
    
    console.log("modules hit");
    let query="select * from lms.modules";

    connection.query(query,(err, result)=>{
        if(err){
            //reject(res.end(JSON.stringify({ "body": err.toString() })));
            reject('{ "body": err.toString() }');
        }

        //resolve( res.json(result));
        resolve( result);

    })
    
})

}

let getcomplexity= async (req,res)=>{
    return new Promise((resolve,reject)=>{

    
    console.log("languages hit");
    let query="select * from lms.complexity";

    connection.query(query,(err, result)=>{
        if(err){
            //reject(res.end(JSON.stringify({ "body": err.toString() })));
            reject('{ "body": err.toString() }');
        }

        //resolve( res.json(result));
        resolve(result);

    })
    
})

}



let runcode = async (req,res)=>{
   
return new Promise((resolve,reject)=>{

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
        
        console.log("runcode   "+executioncode+"    "+usercodetext+"    "+args);
		utils.runJavaScriptCode(req, res, usercodetext, args).then((response) => {
			//res.end(JSON.stringify({ "body": response.toString(), "result": "success" }));
            console.log("runJavaScriptCode   "+response);
            res='{ "body": '+response.toString()+', "result": "success" }';
            resolve(res);
		}).catch((error) => {
			//res.end(JSON.stringify({ "body": error.toString(), "result": "success" }));
            console.log("runJavaScriptCode"+error);
            res='{ "body": '+error.toString()+', "result": "success" }';
            reject(res);
		})

    })
})

}


module.exports={
    getlanguages:getlanguages,
    getcomplexity:getcomplexity,
    getmodules:getmodules,
    runcode:runcode
}