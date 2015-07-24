
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
				if (err === 'empty') res.render('op_res', {
					res: '查不到该考生的信息',
					info: {}
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
/*
app.get('/getinfo', function(req, res) {
	if (req.query.id_number) {
		db('data.mytest').find({
			id_number: '' + req.query.id_number
		}, function(r) {
			if (r.documents.length == 0) {
				res.render('getinfo', {
					info: null
				});
			} else {
				var rep = r.documents[0];
				delete rep._id;
				delete rep.submit_form;
				rep.exam_site_code = mapping_exam_site_code[rep.exam_site_code];
				rep.sex = mapping_sex[rep.sex];
				rep.id_type = mapping_id_type[rep.id_type];
				rep.nationality = mapping_nationality[rep.nationality];
				rep.career = mapping_career[rep.career];
				rep.degree_of_education = mapping_degree_of_education[rep.degree_of_education];
				rep.school = mapping_school[rep.school];
				rep.department = mapping_department[rep.department];
				rep.training_type = mapping_training_type[rep.training_type];
				rep.subject_code = mapping_subject_code[rep.subject_code];
				if (rep.is_our_school === 'true') {
					delete rep.is_our_school;
					delete rep.school;
				} else {
					delete rep.department;
					delete rep.student_number;
				}
				res.render('getinfo', {
					info: rep,
					map: mapping_item
				});
			}
		});
	}

});
*/
app.get('/fillout', function(req, res) {
	res.render('fillout', {});
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
				} else if (err == 'overflow') {
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
