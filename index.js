var express = require('express'),
	app = express(),
    cookieParser = require('cookie-parser'),
    session = require('express-session'), //session
    redisStore = require('connect-redis')(session),

    redis_config = require('./config/LocalConfig.json').redis_config,

	front = require('./router/frontstage'),
    backstage = require('./router/backstage'),
    codeRef = require('./router/codeRef');
    leader = require('./router/configGuide');

app.set("view engine", "ejs");
app.set("view options", {
	"layout": false
});

//session设置
app.use(cookieParser('hsjszx2015',{httpOnly:true}));
app.use(session({
    store: new redisStore(redis_config),
    name:'SESSIONID',
    secret: 'hsjszx2015',
    resave:true,
    saveUninitialized:false,
    unset:'destroy'
}));


//处理静态文件
app.use('/', express.static(__dirname + '/static'));

app.use('/',front);
app.use('/admin',backstage);
app.use('/codeRef',codeRef);
/*
app.use('/',leader);
*/

app.listen(8080, function() {
	console.log('listening on 8080');
});
