

function newcode()
{
    var ParsedRequest = JSON.parse(req.body);
	var usercode = ParsedRequest.code;
    var custominput=ParsedRequest.custominput;
    var args= buildargs(custominput);
    let executioncodequery = `select * from solution where questionid=` + ParsedRequest.questionid;
    connection.query(executioncodequery, (err, result3) => {
        if (err) {
            console.log(err);
            var executioncode = result3[0].executioncode;
            var usercodetext = usercode + executioncode;
            
           runcode(usercodetext,args).then((response)=>{
            res.end(JSON.stringify({ "body": response.toString() })); 
           }).catch((error)=>{
            res.end(JSON.stringify({ "body": error.toString() })); 
        })

           let testcasequery = `select * from testcases where questionid=` + ParsedRequest.questionid;
           connection.query(testcasequery, (err, result2) => {
            if (err) {
                console.log(err);
            }

            getResult(usercodetext, result2).then((response) => {		
                
                		//calculate score

				/* enable on success

				var score = calculatescore();
				var learnerid = 1;
				let learnerquestionsquery = `insert into learnerquestions(answer,score) values("` + usercode + `",` + score + `) where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result2) => {
					if (err) {
						console.log(err);
					}

				})
				*/

			}).catch((error) => {

                				/* enable on failure

				var score = calculatescore();
				let learnerquestionsquery = `insert into learnerquestions(answer,score) values("` + usercode + `",` + score + `) where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result2) => {
					if (err) {
						console.log(err);
					}
				})

				let failureupdate = `insert into learnerquestions set failureattempts=failureattempts+1 where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(failureupdate, (err, result2) => {
					if (err) {
						console.log(err);
					}

				})

				*/

			})

        })
        }
    })

}


async function runcode(data,arguments)
{
	return new Promise((resolve,reject)=>{
	
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


async function getResult(data, cases) {
    return new Promise((resolve, reject) => {
    PromiseRespCount = 0;
    for (var i = 0; i < cases.length; i++) {
        var input = (cases[i].input);
        var output = cases[i].output;
        // var inputstrarr = input.split('<>');
        // var args = ["code.txt", ...inputstrarr];

        var args=buildargs(input);
        runcode(data, args, output).then((response) => {
            
            if (response.replace(/\n/g, '') == output) {
                if (PromiseRespCount == cases.length - 1) {
                    fs.unlinkSync("code.txt");
                    resolve(response);
                }
                PromiseRespCount++;	               
            }
            else{

                reject(response);
            }


        }).catch((error) => {
            reject(error);
        })
    }
})
}






function buildargs(inputstrarr)
{
	var inputstrarray = inputstrarr.split('<>');
			var args = ["code.txt", ...inputstrarray];
			return inputstrarray;
}





let verifyusercode = (req, res) => {
	var ParsedRequest = JSON.parse(req.body)
	console.log(ParsedRequest);
	var usercode = ParsedRequest.code;
	let testcasequery = `select * from testcases where questionid=` + ParsedRequest.questionid;

	var custominput=ParsedRequest.custominput;

	connection.query(testcasequery, (err, result2) => {
		if (err) {
			console.log(err);
		}

		console.log(result2);

		let executioncodequery = `select * from solution where questionid=` + ParsedRequest.questionid;
		connection.query(executioncodequery, (err, result3) => {
			if (err) {
				console.log(err);
			}
			console.log(result3);

			var executioncode = result3[0].executioncode;
			var questiondata = usercode + executioncode;

			var arguments=buildargs(custominput);

			runcode(req,res,questiondata,arguments)

			getResult(questiondata, result2).then((response) => {
				
				res.end(JSON.stringify({ "body": response, "result": "success" }));

				runcode(req,res,questiondata);
				//calculate score

				/* enable on success

				var score = calculatescore();
				var learnerid = 1;
				let learnerquestionsquery = `insert into learnerquestions(answer,score) values("` + usercode + `",` + score + `) where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result2) => {
					if (err) {
						console.log(err);
					}

				})
				*/

			}).catch((error) => {
				res.end(JSON.stringify({ "body": error, "result": "success"}));
				console.log("%%%%%%%%%%%%%%%%%%%%%%%"+error);

				/* enable on failure

				var score = calculatescore();
				let learnerquestionsquery = `insert into learnerquestions(answer,score) values("` + usercode + `",` + score + `) where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(learnerquestionsquery, (err, result2) => {
					if (err) {
						console.log(err);
					}
				})

				let failureupdate = `insert into learnerquestions set failureattempts=failureattempts+1 where learnerid=` + learnerid + ` and questionid=` + ParsedRequest.questionid;
				connection.query(failureupdate, (err, result2) => {
					if (err) {
						console.log(err);
					}

				})

				*/

			})

		})

		//  res.json(result2);
	})

}

