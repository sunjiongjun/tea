
/*
 * GET home page.
 */

exports.index = function(req, res){
	var fs = require('fs');
	fs.readFile('./json.json',function(err,data){
		var jsonObj = JSON.parse(data);
		console.log(jsonObj);
	});

	res.render('index', { title: 'Express' });
};