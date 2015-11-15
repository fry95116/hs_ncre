(function() {
	var mysql = require('mysql'),
		async = require('async'),
		_ = require('underscore'),
		user_config = require('./user_config'),
		db_config = user_config.db_config,
		data_schema = require('./data_schema');

	var con = mysql.createConnection(db_config);

	con.connect(function(err) {
		if (err) throw err;
		console.log('db connected');
	});

  //对数据进行检查
  var check = function(data_in) {
    var err = {};
    // 下面的for循环是用正则表达式验证是否合乎规则
    for (key in data_schema) {
      if (!data_schema[key].test(data_in[key])) {
        // 在 data_schema 中的正则表达式已经为可以为空的key做了匹配规则
        // 如果data_in[key]不存在，表明提交的表单object被修改过，有的键被删除，则err[key]设为'not exist'
        // 否则设为'invalid data'
        err[key] = data_in[key] ? 'invalid data' : 'not exist';
      }
    }

    // 接下来对特殊的验证请求做处理
    // 如果使用的是身份证，则对身份证号码合法性校验
    if(data_in.id_type == "1") {
      id_info = getIdCardInfo(data_in.id_number.toString());
      if(!id_info.isTrue) {
        err['id_number'] = 'invalid data';
      }
    }

    console.log(err);
    if (_.isEmpty(err)) return null;
    return err;
  };

	exports.check = check;

	//人数统计(同考点)
	var getCount = function(exam_site_code, cb) {
		con.query(
			'SELECT count(*) AS \'count\' FROM ' + db_config.table +
			' WHERE exam_site_code=?',
			exam_site_code,
			function(err, res) {
				if (err) cb(err);
				else cb(null, res[0].count);
			});
	};

	exports.getCount = getCount;




	//人数统计(同考点同科目)
	var getCountBySubject = function(exam_site_code, subject_code, cb) {
		con.query(
			'SELECT count(*) AS \'count\' FROM ' + db_config.table + ' WHERE exam_site_code=? AND subject_code=?', [exam_site_code, subject_code],
			function(err, res) {
				if (err) cb(err);
				else cb(null, res[0].count);
			});
	};

	exports.getCountBySubject = getCountBySubject;


	//人数统计(各考点)
	var getStatistics_AllSite = function(cb) {
		con.query(
			'SELECT exam_site_code, count(exam_site_code) as \'count\' FROM ' + db_config.table +
			' GROUP BY exam_site_code',
			function(err, res) {
				if (err) cb(err);
				else cb(null, res);
			});
	}
	exports.getStatistics_AllSite = getStatistics_AllSite;

	//人数统计(同考点各科目)
	var getStatisticsByExamSite_AllSubject = function(exam_site_code, cb) {
		con.query(
			'SELECT subject_code, count(subject_code) as \'count\' from ' + db_config.table +
			' WHERE exam_site_code = ?' +
			' GROUP BY subject_code',
			exam_site_code,
			function(err, res) {
				if (err) cb(err);
				else cb(null, res);
			});
	}
	exports.getStatisticsByExamSite_AllSubject = getStatisticsByExamSite_AllSubject;

	//重复检查
	var repeatCheck = function(id_number, cb) {
		con.query(
			'SELECT count(*) AS \'count\' FROM ' + db_config.table +
			' WHERE id_number=?',
			id_number,
			function(err, res) {
				if (err) cb(err);
				else {
					if (res[0].count > 0) {
						console.log('false');
						cb(null, 'false');
					} else {
						console.log('true');
						cb(null, 'true');
					}
				}
			});
	};
	exports.repeatCheck = repeatCheck;

	//检查某考点，或某考点某科目人数是否被限制
	var getPlanCount = function(exam_site_code, subject_code) {
		if (subject_code) {
			if(!user_config.exam_plan.exam_sites['' + exam_site_code]) return undefined;
			else if(!user_config.exam_plan.exam_sites['' + exam_site_code].subjects['' + subject_code]) return undefined;
			else return user_config.exam_plan.exam_sites['' + exam_site_code].subjects['' + subject_code].count;
		}
		else{
			if(!user_config.exam_plan.exam_sites['' + exam_site_code]) return undefined;
			else return user_config.exam_plan.exam_sites['' + exam_site_code].count;
		}
	}

	exports.getPlanCount = getPlanCount;

	//插入记录
	exports.insertInfo = function(data_in, count, callback) {
		var err = check(data_in);
		if (err != null) callback(err);
		else {
			var re;
			//过滤掉无用的属性
			var data_in = _.pick(data_in, _.keys(data_schema));
			//事物流程
			var insert_transaction = [
				//开始事务
				function(cb) {
					con.beginTransaction(function(err) {
						cb(err);
					});
				},
				//人数检查(考点限制)
				function(cb) {
					var plancount = getPlanCount(data_in.exam_site_code);
					if (!plancount) { //人数未限制
						cb();
					} else {
						getCount(data_in.exam_site_code, function(err, res) {
							if (err) cb(err);
							else {
								if (res >= plancount) cb('overflow_site');
								else cb();
							}
						});
					}
				},
				//人数检查(科目限制)
				function(cb) {
					var plancount = getPlanCount(data_in.exam_site_code,data_in.subject_code);
					if (!plancount) { //人数未限制
						cb();
					} else {
						getCountBySubject(data_in.exam_site_code, data_in.subject_code, function(err, res) {
							if (err) cb(err);
							else {
								if (res >= plancount) cb('overflow_subject');
								else cb();
							}
						});
					}
				},
				//重复检查
				function(cb) {
					repeatCheck(data_in.id_number, function(err, res) {
						if (err) cb(err);
						else {
							if (res === 'false') cb('exist');
							else {
								//插入数据
								var sql = 'INSERT INTO ' + db_config.table +
									' SET ?';
								con.query(sql, data_in, function(err, res) {
									cb(err);
								});
							}
						}
					});
				}
			];
			//执行
			async.series(insert_transaction, function(err, res) {
				if (err) {
					console.log(err);
					con.rollback(
						(function() {
							return function(error) {
								if (error) throw error;
								else {
									console.log('rollback');
									callback(err);
								}
							};
						})()
					);
				} else {
					console.log('succeed');
					con.commit(function(error) {
						if (error) throw error;
						else {
							callback();
						}
					});
				}
			});
		}
	};

	//查看考生信息
	exports.getInfo = function(id_number, callback) {
		var sql = 'SELECT * FROM data WHERE id_number=?';
		con.query(sql, id_number, function(err, res) {
			if (err) callback(err);
			else if (res.length === 0) callback('empty');
			else callback(null, res);
		});
	};

  // 身份证校验算法，
  function getIdCardInfo(cardNo) {
    var info = {
      isTrue : false,
      year : null,
      month : null,
      day : null,
      isMale : false,
      isFemale : false
    };
    if (!cardNo || (15 != cardNo.length && 18 != cardNo.length) ) {
      info.isTrue = false;
      return info;
    }
    if (15 == cardNo.length) {
      var year = cardNo.substring(6, 8);
      var month = cardNo.substring(8, 10);
      var day = cardNo.substring(10, 12);
      var p = cardNo.substring(14, 15); //性别位
      var birthday = new Date(year, parseFloat(month) - 1,
          parseFloat(day));
      // 对于老身份证中的年龄则不需考虑千年虫问题而使用getYear()方法
      if (birthday.getYear() != parseFloat(year)
          || birthday.getMonth() != parseFloat(month) - 1
          || birthday.getDate() != parseFloat(day)) {
        info.isTrue = false;
      } else {
        info.isTrue = true;
        info.year = birthday.getFullYear();
        info.month = birthday.getMonth() + 1;
        info.day = birthday.getDate();
        if (p % 2 == 0) {
          info.isFemale = true;
          info.isMale = false;
        } else {
          info.isFemale = false;
          info.isMale = true
        }
      }
      return info;
    }
    if (18 == cardNo.length) {
      var year = cardNo.substring(6, 10);
      var month = cardNo.substring(10, 12);
      var day = cardNo.substring(12, 14);
      var p = cardNo.substring(14, 17)
      var birthday = new Date(year, parseFloat(month) - 1,
          parseFloat(day));
      // 这里用getFullYear()获取年份，避免千年虫问题
      if (birthday.getFullYear() != parseFloat(year)
          || birthday.getMonth() != parseFloat(month) - 1
          || birthday.getDate() != parseFloat(day)) {
        info.isTrue = false;
        return info;
      }
      var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];// 加权因子
      var Y = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];// 身份证验证位值.10代表X
      // 验证校验位
      var sum = 0; // 声明加权求和变量
      var _cardNo = cardNo.split("");
      if (_cardNo[17].toLowerCase() == 'x') {
        _cardNo[17] = 10;// 将最后位为x的验证码替换为10方便后续操作
      }
      for ( var i = 0; i < 17; i++) {
        sum += Wi[i] * _cardNo[i];// 加权求和
      }
      var i = sum % 11;// 得到验证码所位置
      if (_cardNo[17] != Y[i]) {
        return info.isTrue = false;
      }
      info.isTrue = true;
      info.year = birthday.getFullYear();
      info.month = birthday.getMonth() + 1;
      info.day = birthday.getDate();
      if (p % 2 == 0) {
        info.isFemale = true;
        info.isMale = false;
      } else {
        info.isFemale = false;
        info.isMale = true
      }
      return info;
    }
    return info;
  }

})();
