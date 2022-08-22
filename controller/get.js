var mysql = require('mysql');
const { get } = require('../api');

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

module.exports={
    getlanguages:getlanguages,
    getcomplexity:getcomplexity,
    getmodules:getmodules
}