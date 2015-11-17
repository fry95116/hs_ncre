
var express = require('express'),
	bodyparser = require('body-parser'), //解析post请求用
	app = express(),
	_ = require('underscore'),
	async = require('async'),
	dbc = require('./dbc'),
	tr = require('./tr'),
	user_config = require('./user_config'),
	util = require('util');

var sub = user_config.plan_count,
	op_res_text = user_config.op_res_text;

app.set("view engine", "ejs");
app.set("view options", {
	"layout": false
});

//中间件
app.use('/submit', bodyparser.urlencoded({
	extended: true
})); //post请求

app.use('/', express.static(__dirname + '/static')); //处理静态文件

app.get('/', function(req, res) {
	async.parallel([
		function(cb) {
			dbc.getCount(410067, function(err, res) {
				cb(err, res);
			});
		},
		function(cb) {
			dbc.getCount(410084, function(err, res) {
				cb(err, res);
			});
		}
	], function(err, result) {
		if (err) throw err;
		else res.render('welcome', {
			count1: result[0],
			count2: result[1],
			sub1: sub['410067'],
			sub2: sub['410084']
		});
	});
});

app.get('/getinfo', function(req, res) {
	if (req.query.id_number) {
		dbc.getInfo(req.query.id_number, function(err, result) {
			if (err) {
				console.log(err);
				if (err === 'empty') res.render('getInfo', {
					info: null
				});
			} else {
				var out = {};
				for (i in tr.data_schema_convert) {
					out[tr.data_schema_convert[i]] = (result[0])[i];
				}
				console.log(out);
				res.render('getinfo', {
					info: out,
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


app.get('/fillout', function(req, res) {
	res.render('fillout', {tr:tr, exam_plan:user_config.exam_plan});
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
	var now = Date();
	console.log(now.toString() + '  【【请求】】' + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】:' + util.inspect(req.body).replace(/\n/g, ''))

	if (req.body) {
		// 将身份证中可能出现的x变成大写字母
		if(req.body.id_type = 1){
			req.body.id_number.toUpperCase();
		}
		//生成备注
		if (req.body.is_our_school) {
			req.body.remark = '' + tr.department[req.body.department] + req.body.student_number;
		} else {
			if (req.body.school == '01') req.body.remark = req.body.school_name;
			else req.body.remark = tr.school[req.body.school];
		}
		//插入数据
		dbc.insertInfo(req.body, sub['' + req.body.exam_site_code], function(err) {
			if (err) {

				// “数据错误”、“已存在”、“考点报滿”、“科目报滿” 而提交失败的日志记录
				var now = Date();
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
				var now = Date();
				console.log(now.toString() + '【【提交成功】】' + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】' + util.inspect(req.body).replace(/\n/g, ''))

				res.render('op_res', {
					res: op_res_text.succeed,
					info: {}
				});
			}
		});
	}
});

app.listen(8081, function() {
	console.log('listening on 8081');
});
