var express = require('express'),

	app = express(),

	front = require('./router_front'),
    backstage = require('./router_backstage'),
    leader = require('./router_conf_guide.js');

app.set("view engine", "ejs");
app.set("view options", {
	"layout": false
});

//处理静态文件
app.use('/', express.static(__dirname + '/static'));

//app.use('/',front);
//app.use('/admin',backstage);

app.use('/',leader);

app.listen(8080, function() {
	console.log('listening on 8080');
});
