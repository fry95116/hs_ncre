var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'), //session
    redisStore = require('connect-redis')(session),

	local_config = require('./config/LocalConfig.json'),
    redis_config = local_config.redis_config,

    leader = require('./router/configGuide');

//前台和后台放在一个端口
if(local_config.Port_frontStage === local_config.Port_backStage){

	var app = express();

	app.set("view engine", "ejs");
	app.set("view options", {"layout": false});
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
	//各个路由
	app.use('/',require('./router/frontstage'));
	app.use('/admin',require('./router/backstage'));
	app.use('/codeRef',require('./router/codeRef'));
	/*
	 app.use('/',leader);
	 */
	app.listen(local_config.Port_frontStage, function() {
		console.log('frontStage & backStage listening on ' + local_config.Port_frontStage);
	});
}
else{
	var app_frontStage = express(),
	app_backStage = express();

	//模板引擎
	app_frontStage.set("view engine", "ejs");
	app_frontStage.set("view options", {"layout": false});

	app_backStage.set("view engine", "ejs");
	app_backStage.set("view options", {"layout": false});
	//session设置
	app_frontStage.use(cookieParser('hsjszx2015',{httpOnly:true}));
	app_frontStage.use(session({
		store: new redisStore(redis_config),
		name:'SESSIONID',
		secret: 'hsjszx2015',
		resave:true,
		saveUninitialized:false,
		unset:'destroy'
	}));

	app_backStage.use(cookieParser('hsjszx2015',{httpOnly:true}));
	app_backStage.use(session({
		store: new redisStore(redis_config),
		name:'SESSIONID',
		secret: 'hsjszx2015',
		resave:true,
		saveUninitialized:false,
		unset:'destroy'
	}));
	//处理静态文件
	app_frontStage.use('/', express.static(__dirname + '/static'));

	app_backStage.use('/', express.static(__dirname + '/static'));
	//各个路由
	app_frontStage.use('/',require('./router/frontstage'));
	app_frontStage.use('/codeRef',require('./router/codeRef'));

	app_backStage.use('/admin',require('./router/backstage'));
	app_backStage.use('/codeRef',require('./router/codeRef'));
	/*
	 app.use('/',leader);
	 */
	app_frontStage.listen(local_config.Port_frontStage, function() {
		console.log('frontStage listening on ' + local_config.Port_frontStage);
	});
	app_backStage.listen(local_config.Port_backStage, function() {
		console.log('backStage listening on ' + local_config.Port_backStage);
	});
}