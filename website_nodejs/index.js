
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

//统计报名人数信息
function getRegInfo(callback){
	//构建并行查询
	var querylist = [
		function(cb) {
			dbc.getStatistics_AllSite(function(err, res) {
				if(err) cb(err);
				else{
					var sites = {};
					for(var site_code in user_config.exam_plan.exam_sites){
						sites[site_code] = 0;
					}
					cb(null, _.defaults(res,sites));
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

app.get('/', function(req, res) {
	getRegInfo(function(reginfo){
		res.render('welcome', {
			reg_info:reginfo
		});
	});
});

/*
app.get('/', function(req, res) {
	dbc.getStatistics_AllSite(function(err,res){
		if(err) throw err;
		else{
			regNum = {};
			for(site_code in user_config.exam_plan){
				regNum[site_code].count = res[site_code] || 0;
			}
		}
	});
});
*/
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
						data_schema_convert: tr.data_schema_convert,
						info: err
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

app.listen(8081, function() {
	console.log('listening on 8080');
});
