/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var nodeStatic = require('node-static').Server;
var fileServer = new nodeStatic("./");
var dns = require("dns");
var app = express();
var request = require("request");
// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.set("view options", {
	"layout": false
});

console.log('--------------精简版本地代理系统-----------------------------');
console.log('--------------请书写json.json文件----------------------------');
console.log('--------------作者：灼翎-------------------------------------');
console.log('--------------版本：V1.0-------------------------------------');
console.log('--------------Control+C中断----------------------------------');
var httpServer = http.createServer(function(req, res) {

	req.addListener('end',
	function() {
		fileServer.serve(req, res,
		function(err, result) {
			var filetype = '' ;
			if(req.url.indexOf('.css') > -1){
				filetype = 'text/css';
			}
			else if(req.url.indexOf('.png')>-1){
				filetype ='image/gif';
			}
			else if(req.url.indexOf('.jpeg')>-1){
				filetype ='image/pjpeg';
			}
			else if(req.url.indexOf('.jpg')>-1){
				filetype ='image/pjpeg';
			}
			else if(req.url.indexOf('.gif')>-1){
				filetype ='image/gif';
			}
			else if(req.url.indexOf('.js')>-1){
				filetype = 'application/x-javascript' ;
			}
			else{
				filetype = 'application/x-javascript' ;
			}

			if (err && (err.status === 404)) {  //本地没有文件访问线上
				var fs = require('fs');
				fs.readFile('./json.json',function(err, data) {
					var jsonObj = JSON.parse(data);
					var islocal = false,
					localfile = '';
					for (var i = 0; i < jsonObj.length; i++) {
						var index = req.url.indexOf(jsonObj[i].before) ;
						if (index > -1) {
							islocal = true;
							var substr = req.url.substr(index + jsonObj[i].before.length);
							localfile = jsonObj[i].end + substr.split('?')[0];
						}
					}
					if (islocal) {
						fs.readFile(localfile,function(err, data) {
							if (err) {
								getFileByDns(req,res);
							} else {
						
								res.writeHeader(200, 
								{
									'Content-Type': filetype,
									'httpurl':req.url,
									'localfile':localfile
								});
								res.end(data);
							}
						});
					}

					if (!islocal) {
						getFileByDns(req,res);
					}
				});
			}
		});
	}).resume();
});

httpServer.listen(80);

function getFileByDns(req,res){
	dns.resolve4(req.headers.host,function(err, addresses) {
		if (err) {
			res.writeHeader(200, {"Content-Type": filetype});
			res.write(req.url);
			res.end(err);
		} else {

			var ip = addresses[0];
			var p = 'http://' + ip + req.url;
			p = p.replace('http://g.tbcdn.cn', ''); //利用ip地址访问
			req.headers['Host'] = req.headers.host;

			request({
				method: req.method,
				url: p,
				headers: req.headers
			}).pipe(res);
		}
	});
}