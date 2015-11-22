
var express = require('express'),
	bodyparser = require('body-parser'), //解析post请求用
	cookieParser = require('cookie-parser'),
	session = require('express-session'), //session
	app = express(),

	_ = require('underscore'),
	async = require('async'),

	dbc = require('./dbc'),
	tr = require('./tr'),
	user_config = require('./user_config'),
	util = require('util'),

	captchapng = require('captchapng');//验证码模块

var op_res_text = user_config.op_res_text;



//统计报名人数信息
function getRegInfo(callback){
	//构建并行查询
	var querylist = [
		function(cb) {
			dbc.getStatistics_AllSite(function(err, res) {
				if(err) cb(err);
				else{
					var sites = {};
					if(user_config.exam_plan.hasOwnProperty('exam_sites')){
						for(var site_code in user_config.exam_plan.exam_sites){
							sites[site_code] = 0;
						}
						cb(null, _.defaults(res,sites));
					}
				}
			});
		}
	];

	for(var site_code in user_config.exam_plan.exam_sites){

		var picker =[];
		for(var subject_code in user_config.exam_plan.exam_sites[site_code].subjects){
			if(user_config.exam_plan.exam_sites[site_code].subjects[subject_code].count){
				picker.push(subject_code);
			}
		}

		querylist.push(_.partial(function(site_code, picker, cb){
			dbc.getStatisticsByExamSite_AllSubject(site_code,function(err,res){
				if(err) cb(err);
				else{
					res = _.pick(res,picker);

					var subjects = {};
					for(var sc in picker){
						subjects[ picker[sc] ] = 0;
					}

					res = _.defaults(res,subjects);
					cb(null,{exam_site_code:site_code,counts:res});
				}
			});
		},site_code,picker));
	}

	async.parallel(querylist, function(err, result) {
		if (err) throw err;
		else {
			var re = {};

			//组装考点人数统计
			var siteCount = result[0];

			for (var esc in siteCount){
				re[esc] = {
					name:user_config.exam_plan.exam_sites[esc].name,
					total:user_config.exam_plan.exam_sites[esc].count,
					count:siteCount[esc]
				};
			}

			//组装科目人数统计
			for (var i = 1; i < result.length; ++i){
				var subject_count = result[i];
				re[subject_count.exam_site_code].subjects = {};
				for(var sc in subject_count.counts){
					re[subject_count.exam_site_code].subjects[sc] = {
						name:user_config.exam_plan.exam_sites[subject_count.exam_site_code].subjects[sc].name,
						total:user_config.exam_plan.exam_sites[subject_count.exam_site_code].subjects[sc].count,
						count:subject_count.counts[sc]
					}
				}
			}

			callback(re);
		}
	});
}

app.set("view engine", "ejs");
app.set("view options", {
	"layout": false
});

//中间件
app.use('/submit', bodyparser.urlencoded({
	extended: true
})); //post请求

app.use('/', express.static(__dirname + '/static')); //处理静态文件

app.use(cookieParser());
app.use(session({ secret: 'myserect',resave:true,saveUninitialized:false }));

//路由

//主页
app.get('/', function(req, res) {
	getRegInfo(function(reginfo){
		res.render('welcome', {
			reg_info:reginfo
		});
	});
});

//考生信息查询界面
app.get('/getinfo', function(req, res) {
	if (req.query.id_number) {
		dbc.getInfo(req.query.id_number, function(err, result) {
			if (err) {
				//console.log(err);
				if (err === 'empty') res.render('getinfo', {
					info: null
				});
			} else {
				var out = {};
				result = result[0];
				//组装报名信息对象
				out[tr.data_schema_convert.name] = result.name;
				out[tr.data_schema_convert.exam_site_code] = user_config.exam_plan.exam_sites[result.exam_site_code].name;
				out[tr.data_schema_convert.subject_code] = user_config.exam_plan.exam_sites[result.exam_site_code].subjects[result.subject_code].name;
				out[tr.data_schema_convert.sex] = _.find(tr.sex,function(o){return o.code == result.sex}).name;
				out[tr.data_schema_convert.id_type] = _.find(tr.id_type,function(o){return o.code == result.id_type}).name;
				out[tr.data_schema_convert.nationality] = _.find(tr.nationality,function(o){return o.code == result.nationality}).name;
				out[tr.data_schema_convert.career] = _.find(tr.career,function(o){return o.code == result.career}).name;
				out[tr.data_schema_convert.degree_of_education] = _.find(tr.degree_of_education,function(o){return o.code == result.degree_of_education}).name;
				out[tr.data_schema_convert.training_type] = _.find(tr.training_type,function(o){return o.code == result.training_type}).name;
				out[tr.data_schema_convert.remark] = result.remark;
				//console.log(out);
				res.render('getinfo', {
					info: out
				});
			}
		});
	} else {
		res.render('op_res', {
			res: '查询格式错误',
			info: {}
		});
	}
});

//获取验证码图片
app.get('/captcha', function(req, res) {

	//六位随机数验证码

	var num_captcha = parseInt(Math.random() * 900000 + 100000);
	req.session.captcha = num_captcha;
	var captcha = new captchapng(158,37,num_captcha);
	captcha.color(255, 255, 255, 255);  // First color: background (red, green, blue, alpha)
	captcha.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

	var imgbase64 = new Buffer(captcha.getBase64(),'base64');
	res.writeHead(200, {
		'Content-Type': 'image/png'
	});
	res.end(imgbase64);

});

//验证码检测
app.get('/captchatest',function(req, res) {
	res.send(req.session.captcha == req.param('test').toUpperCase());
});

//考生信息填报界面
app.get('/fillout', function(req, res) {
	res.render('fillout', {tr:tr, exam_plan:user_config.exam_plan,error_info:''});
});


/*重复检查*/
app.get('/repeatcheck', function(req, res) {
	if (req.query.id_number) {
		dbc.repeatCheck(req.query.id_number, function(err, result) {
			if (err) res.send(err);
			else res.send(result);
		});
	}
});

/*处理提交的考生记录*/
app.post('/submit', function(req, res) {

	// 对于每一次请求都做一次日志记录
	var now = Date.now();
	console.log(now.toString() + '  【【请求】】' + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】:' + util.inspect(req.body).replace(/\n/g, ''))


	if (req.body) {
		//验证验证码
		if(!req.session || req.session.captcha != req.body.captcha.toUpperCase()){
			res.render('op_res', {
				res: '验证码错误',
				info: {}
			});
			return;
		}
		//清空session
		req.session.captcha = '';


		// 将身份证中可能出现的x变成大写字母
		if(req.body.id_type == 1){
			req.body.id_number =　req.body.id_number.toUpperCase();
		}
		//生成备注
		if (req.body.is_our_school) {
			req.body.remark = '' + _.find(tr.department,function(o){return o.code == req.body.department}).name + req.body.student_number;
		} else {
			if (req.body.school == '01') req.body.remark = req.body.school_name;
			else req.body.remark = _.find(tr.school,function(o){return o.code == req.body.school}).name;
		}
		//插入数据
		dbc.insertInfo(req.body, function(err) {
			if (err) {

				// “数据错误”、“已存在”、“考点报滿”、“科目报滿” 而提交失败的日志记录
				var now = Date.now();
				console.log(now.toString() + '【【提交失败】】'+ '  【错误类型】：'+ err.error_type + '  【错误原因】' + util.inspect(err.err_info).replace(/\n/g, '') + util.inspect(err) + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】：' + util.inspect(req.body).replace(/\n/g, ''))

				if (err.error_type == 'exist') {
					res.render('op_res', {
						res: op_res_text.exist,
						info: {}
					});
				} else if (err.error_type == 'overflow') {
					res.render('op_res', {
						res: op_res_text.overflow,
						info: {}
					});
				} else {
					res.render('op_res', {
						res: op_res_text.other_err,
						data_schema_convert: tr.data_schema_convert,
						info: err.err_info
					});
				}
			} else {
				// 提交成功

				// 提交成功的日志记录
				var now = Date.now();
				console.log(now.toString() + '【【提交成功】】' + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】' + util.inspect(req.body).replace(/\n/g, ''))

				res.render('op_res', {
					res: op_res_text.succeed,
					info: {}
				});
			}
		});
	}
});

app.listen(8080, function() {
	console.log('listening on 8080');
});
