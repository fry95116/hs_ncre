
var express = require('express'),
	bodyparser = require('body-parser'), //解析post请求用
	app = express(),
	_ = require('underscore'),
	async = require('async'),
	dbc = require('./dbc'),
	tr = require('./tr'),
	user_config = require('./user_config');

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
				for (i in user_config.getinfo_items) {
					out[user_config.getinfo_items[i]] = (result[0])[i];
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
	res.render('fillout', {tr:tr});
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
	if (req.body) {
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
				if (err === 'exist') {
					res.render('op_res', {
						res: op_res_text.exist,
						info: {}
					});
				} else if (err == 'overflow_site' || err == 'overflow_subject') {
					res.render('op_res', {
						res: op_res_text.overflow,
						info: {}
					});
				} else {
					res.render('op_res', {
						res: op_res_text.other_err,
						info: error
					});
				}
			} else {
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
