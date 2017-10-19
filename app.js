'use strict';

const http = require('http');
const fs = require('fs');
const url = require('url');
const github = require('./lib/github-wrapper');

const myJsonFile = require('./data/commits.json');
const myStrFile = JSON.stringify(myJsonFile, null, 2);

const hostname = 'localhost';
const port = 3000;

github.authenticate(process.env.GITHUB_ACCESS_TOKEN);

const server = http.createServer( (req, res) => {
	fs.readFile(__dirname + '/public/index.html', 'utf8', (err,data) => {
		if (err) {
			res.writeHead(404);
			res.end("404 Not Found");
		} else {
			let queryString = url.parse(req.url).query;
			if (queryString) {
				let params = getParams(queryString);
				//console.log(`user = ${params[1]} and repo = ${params[2]}`);
				let githubParams = {owner: params[1], repo: params[2] };
				github.getRepoCommits(githubParams);
			}

			res.writeHead(200, {
				"Content-Type": "text/html"
			});
			let goodToGo = data.replace('{{ commitFeed }}', myStrFile);
			res.end(goodToGo);
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
