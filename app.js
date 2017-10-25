'use strict';

const http = require('http');
const fs = require('fs');
const url = require('url');
const github = require('./lib/github-wrapper');

const hostname = 'localhost';
const port = 4000;

github.authenticate(process.env.GITHUB_ACCESS_TOKEN);

const server = http.createServer( (req, res) => {
	fs.readFile(__dirname + '/public/index.html', 'utf8', (err, data) => {
		if (err) {
			res.writeHead(404);
			res.end("404 Not Found");
		} else {
			let queryString = url.parse(req.url).query;
			if (queryString) {
				let params = getParams(queryString);
				// console.log(`user = ${params[1]} and repo = ${params[2]}`);
				let githubParams = {owner: params[1], repo: params[2] };
 				let p = github.getRepoCommits(githubParams);
				p.then(result => {
					//console.log(res.data[0].commit); // traversing the object returned from github
					console.log('>>>>> in P1 THEN: ' + result);
					let trimmedResult = github.trimMeDown(result.data);
					let trimmedResultStringified = JSON.stringify(trimmedResult, null, " ");
					//console.log(trimmedResStringified);
					let path = './data/commits.json';
					let p2 = github.doWriting(path, trimmedResultStringified);
					p2.then(result => {
						console.log('>>>>> in P2 THEN: ' + result);
		 		res.writeHead(200, {"Content-Type": "text/html"});
				const myJsonFile = require('./data/commits.json');
				const myStrFile = JSON.stringify(myJsonFile, null, 2);
				let goodToGo = data.replace('{{ commitFeed }}', '<strong>HAVE PARAMETERS!!</strong>');
				// let goodToGo = data.replace('{{ commitFeed }}', myStrFile);
				res.end(goodToGo);							
					})
					.catch(err => {
						console.log('>>>>> in P2 CATCH: ');
						console.log(err);
					});
				})
				.catch(err => {
					console.log('>>>>> in P1 CATCH: ');
					console.log(err); // verbose mode
					// console.log('DC promise rejected: \n' + err); // one-sentence mode
				});				
			} else {
				console.log('>>> I am in the ELSE');
		 		res.writeHead(200, {"Content-Type": "text/html"});
				const myJsonFile = require('./data/commits.json');
				const myStrFile = JSON.stringify(myJsonFile, null, 2);
				// let goodToGo = data.replace('{{ commitFeed }}', myStrFile);
				let goodToGo = data.replace('{{ commitFeed }}', '<strong>NO PARAMS :(</strong>');
				res.end(goodToGo);					
			}
		}
	});
});

let getParams = (url) => {
	let regex = /user=(\w+)&repo=(\w+)/g;
	let params = regex.exec(url);
	return params;
};

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
