
var express = require('express'),
	bodyparser = require('body-parser'), //解析post请求用
	app = express(),
	db = require('mongous').Mongous,
	fs = require('fs'),
	_ = require('underscore'),
	dbc = require('./dbc'),
	tr = require('./tr'),
	async = require('async');

var sub = {
	'410067': 1140,
	'410084': 2861
};

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
	console.log(req.body);
	if (req.body) {
		//生成备份
		/*if (req.body.is_our_school) {
			req.body.remark = '' + tr.department[req.body.department] + req.body.student_number;
		} else {
			if (req.body.school == '01') req.body.remark = req.body.school_name;
			else req.body.remark = tr.school[req.body.school];
		}*/
		dbc.insertInfo(req.body, sub['' + req.body.exam_site_code], function(err) {
			if (err) res.send(err);
			else res.send('ok');
		});
	}
});
/*
app.post('/submit', function(req, res) {

	var error = check(req.body);
	if (isEmpty(error)) {
		res.render('op_res', {
			res: '提交失败',
			info: error
		});
	} else {
		var count = 0,sub=0;
		db('data.mytest').find({exam_site_code:''+req.body.exam_site_code}, function(r) {
			if (r.more === undefined) {
				count += r.numberReturned;
				if(req.body.exam_site_code=='410067'){
					sub=sub1;
				}
				else{
					sub=sub2;
				}
				if (count >= sub) {
					res.render('op_res', {
						res: '提交失败：名额已满',
						info: {}
					});
				} else {
					db('data.mytest').find({
						id_number: '' + req.body.id_number
					}, function(r) {
						if (r.documents.length == 0) {
							req.body.ip=req.ip;
							db('data.mytest').insert(req.body);
							res.render('op_res', {
								res: '您已报名成功,如要查询报名结果,请返回主页。<br>报名成功后,需要考生现场校对信息和缴费,安排如下:<br>花园校区考点：6月22日～6月25日8:30-17:00，地点：综合实验楼401。<br>龙子湖校区考点：6月22日～6月26日8:30-20:00，地点：实验楼S2一楼101房间。',
								info: {}
							});
						} else {
							res.render('op_res', {
								res: '提交失败：您已报名,请勿重复提交',
								info: {}
							});
						}
					});
				}
			} else {
				count += r.numberReturned;
			}
		});
	}
});
*/
app.listen(8080, function() {
	console.log('listening on 8080');
});

function check(form) {
	//console.log(form);
	var error = {};
	//考点代码
	if (form.exam_site_code) {

	} else {
		error.exam_site_code = 'empty';
	}
	//姓名
	if (form.name) {
		if (form.name.bytes() > 32) {
			error.name = 'too lang';
		}
	} else {
		error.name = 'empty';
	}
	//性别
	if (form.sex) {
		if (form.sex != 'male' && form.sex != 'famale') {
			error.sex = 'can not distinguish';
		}
	} else {
		error.sex = 'empty';
	}
	//出生日期
	if (form.birthday) {

	} else {
		error.birthday = 'empty';
	}
	//证件类型
	if (form.id_type) {
		if (form.id_type < 1 || form.id_type > 5) {
			error.id_type = 'unknown id_type';
		}
	} else {
		error.id_type = 'empty';
	}
	//证件号码
	if (form.id_number) {
		if (form.id_type == 1 && form.id_number.length != 18) {
			error.id_number = 'wrong number';
		}
	} else {
		error.id_number = 'empty';
	}
	//民族
	if (form.nationality) {
		if (form.nationality < 1 || form.nationality > 98) {
			error.nationality = 'unknown nationality code';
		}
	} else {
		error.nationality = 'empty';
	}
	//职业
	if (form.career) {
		if (form.career < 1 || form.career > 99) {
			error.career = 'unknown career code';
		}
	} else {
		error.career = 'empty';
	}
	//文化程度
	if (form.degree_of_education) {
		if (form.degree_of_education < 1 || form.degree_of_education > 8) {
			error.degree_of_education = 'unknown degree_of_education code';
		}
	} else {
		error.degree_of_education = 'empty';
	}
	//培训类型
	if (form.training_type) {
		if (form.training_type < 1 || form.training_type > 3) {
			error.training_type = 'unknown training_type code';
		}
	} else {
		error.training_type = 'empty';
	}
	//邮编
	//地址长度
	if (form.address) {
		if (form.address.length > 64) {
			error.address = 'too lang';
		}
	}
	//考试科目代码
	if (form.subject_code) {
		if (form.subject_code) {

		}
	} else {
		error.subject_code = 'empty';
	}
	//联系电话
	if (form.phone) {
		if (/\d*/.test(form.phone) || form.phone === undefined) {

		}
	} else {
		error.phone = 'empty';
	}
	//备注????
	if (form.is_our_school) {
		//学院
		if (form.department) {
			if (form.department == 0) {
				error.department = 'department not selected'
			}
		} else {
			error.department = 'empty';
		}
		//学号
		if (form.student_number) {
			if (/\d{9}\d*/.test(form.student_number) == false) {
				error.student_number = 'unknown student_number'
			}
		} else {
			error.student_number = 'empty';
		}
	} else {
		if (form.school) {
			if (form.school == 0) {
				error.class = 'school not selected'
			}
		} else {
			error.school = 'empty';
		}
	}
	//
	return error;
}
