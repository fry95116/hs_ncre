var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'), //session
    redisStore = require('connect-redis')(session),

	log = require('./Logger').getLogger(),

	local_config = require('./config/LocalConfig.json'),
    redis_config = local_config.redis_config,
	cron = require('./cron'),
    leader = require('./router/configGuide');


//获取IP
function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
		'unknown'
}

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
	//日志记录
	app.use(function(req,res,next){
		req.log = log.child({
            method:req.method,
            url:req.originalUrl,
            remoteAddress:getClientIp(req)
		});
		next();
	});
	//各个路由
    app.use('/codeRef',require('./router/codeRef'));
    app.use('/admin',require('./router/backstage'));
    /*注意:后台路由一定要放在前台路由之后
    * 否则前中的功能控制会过滤掉后端路由*/
    app.use('/',require('./router/frontstage'));

	/*
	 app.use('/',leader);
	 */
	app.listen(local_config.Port_frontStage, function() {
		log.info('frontStage & backStage listening on ' + local_config.Port_frontStage);
	});
}
else{
	var app_frontStage = express(),
	app_backStage = express();

	/****************************** 后台app设置 *****************************************/
    app_backStage.set("view engine", "ejs");						//模板引擎
	app_backStage.set("view options", {"layout": false});
	app_backStage.use(cookieParser('hsjszx2015',{httpOnly:true}));	//session设置
	app_backStage.use(session({
		store: new redisStore(redis_config),
		name:'SESSIONID',
		secret: 'hsjszx2015',
		resave:true,
		saveUninitialized:false,
		unset:'destroy'
	}));
	app_backStage.use('/', express.static(__dirname + '/static'));	//处理静态文件
    app_backStage.use(function(req,res,next){
        req.log = log.child({
            method:req.method,
            url:req.originalUrl,
            remoteAddress:getClientIp(req)
        });
        next();
    });
	app_backStage.use('/admin',require('./router/backstage'));		//各个路由
	app_backStage.use('/codeRef',require('./router/codeRef'));
	/*
	 app.use('/',leader);
	 */

    /****************************** 前台app设置 *****************************************/

    app_frontStage.set("view engine", "ejs");						//模板引擎
    app_frontStage.set("view options", {"layout": false});
    app_frontStage.use(cookieParser('hsjszx2015',{httpOnly:true}));	//session设置
    app_frontStage.use(session({
        store: new redisStore(redis_config),
        name:'SESSIONID',
        secret: 'hsjszx2015',
        resave:true,
        saveUninitialized:false,
        unset:'destroy'
    }));
    app_frontStage.use('/', express.static(__dirname + '/static'));	//处理静态文件
    app_frontStage.use(function(req,res,next){
        req.log = log.child({
            method:req.method,
            url:req.originalUrl,
            remoteAddress:getClientIp(req)
        });
        next();
    });
    app_frontStage.use('/',require('./router/frontstage'));			//各个路由
    app_frontStage.use('/codeRef',require('./router/codeRef'));


	app_frontStage.listen(local_config.Port_frontStage, function() {
		log.info('frontStage listening on ' + local_config.Port_frontStage);
	});
	app_backStage.listen(local_config.Port_backStage, function() {
        log.info('backStage listening on ' + local_config.Port_backStage);
	});
}