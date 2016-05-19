(function() {
	var mysql = require('mysql'),
			async = require('async'),
			_ = require('underscore'),
			data_schema = require('./data_schema'),

			user_config = require('./user_config'),
			db_config = user_config.db_config,
			sites_info = user_config.sites_info,
			limit_rules = user_config.limit_rules,
			tools = require('./tools');

	var con;
	//以下代码用于维持mysql的连接
	//后期可以考虑连接池
	function handleDisconnect() {
		con = mysql.createConnection(db_config); // Recreate the connection, since
														// the old one cannot be reused.

		con.connect(function(err) {              // The server is either down
			if(err) {                                     // or restarting (takes a while sometimes).
				console.log('error when connecting to db:', err);
				setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
			}                                     // to avoid a hot loop, and to allow our node script t
			else{
				console.log('db connected');

			}
		});                                     // process asynchronous requests in the meantime.
												// If you're also serving http, display a 503 error.
		con.on('error', function(err) {
			if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
				console.log('server closed the connection.reconnect...');
				handleDisconnect();                         // lost due to either server restart, or a
			} else {                                      // connnection idle timeout (the wait_timeout
				throw err;                                  // server variable configures this)
			}
		});
	}
	handleDisconnect();

	//对数据进行检查
	var check = function(data_in) {
		var err = {};
		// 下面的for循环是用正则表达式验证是否合乎规则
		for (var key in data_schema) {
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
			var id_info = tools.getIdCardInfo(data_in.id_number.toString());
			if(!id_info.isTrue) {
				err['id_number'] = 'invalid data';
			}
		}

		// 考点和科目的后端联动验证
        console.log(_.indexOf(sites_info.get('$[*].code'), parseInt(data_in.exam_site_code)));
		if(_.indexOf(sites_info.get('$[*].code'), parseInt(data_in.exam_site_code)) == -1){
			err['exam_site_code'] = 'invalid data';
		}
		else if(_.indexOf(sites_info.get('$[?(@.code=='+data_in.exam_site_code+')].subjects[*].code'), parseInt(data_in.subject_code)) == -1) {
			err['subject_code'] = 'subject not supported in this site';
		}

		if (_.isEmpty(err)) {
			return null;
		}
		else {
			return {error_type: 'data_error', err_info: err};
		}
	};

	exports.check = check;

	//人数统计（一次性返回所有信息）
	var getStatistics = function(callback){
		//组装模板
		var sites_template = {};
		var subjects_template = {};

		for(var site in sites_info){
			sites_template[ sites_info[site].code ] = 0;
			subjects_template[ sites_info[site].code ] = {};

			for (var subject in sites_info[site]['subjects']){
				subjects_template[ sites_info[site].code ][ sites_info[site]['subjects'][subject].code ] = 0;
			}
        }

        //查询
        var query_str = 'SELECT exam_site_code, subject_code, count(examSite_subject_code) as \'count\'' +
            ' from ' + db_config.table +
			' GROUP BY examSite_subject_code;';
        con.query(
            query_str,
			function (err, res) {
                if (err) callback(err);
                else {
                    for (var i in res) {
                        sites_template[res[i].exam_site_code] += res[i].count;
                        subjects_template[res[i].exam_site_code][res[i].subject_code] += res[i].count;
                    }
                    callback(null, {
                        sitesCount: sites_template, 
                        subjectCount: subjects_template
                    });
                }
            }
        );
        /*
		//构建并行查询
		var querylist = [
			function(cb) {
				getStatistics_AllSite(function(err, res) {
					if(err) cb(err);
					else cb(null, _.defaults(res,sites_template));
				});
			}
		];

		for(var i = 0; i < sites_info.length; ++i){
			querylist.push(_.partial(function(site_code, subject_template, cb){
				getStatisticsByExamSite_AllSubject(site_code,function(err,res){
					if(err) cb(err);
					else {
						var re = {};
						re[site_code] = _.defaults(res,subject_template);
						cb(null,re);
					}
				});
			},sites_info[i].code,subjects_template[sites_info[i].code]));
		}

		//查询
		async.parallel(querylist, function(err, result) {
			if (err) callback(err);
			else {
				var re = {};

				//组装考点人数统计
				re.sitesCount = result[0];

				//组装科目人数统计
				re.subjectCount = {};
				for (var i = 1; i < result.length; ++i){
					_.extendOwn(re.subjectCount,result[i]);
				}

				callback(null,re);
			}
		});*/

	};
	exports.getStatistics = getStatistics;

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
							//console.log('false');
							cb(null, 'false');
						} else {
							//console.log('true');
							cb(null, 'true');
						}
					}
				});
	};
	exports.repeatCheck = repeatCheck;

	//按规则检查人数
	var checkCount = function(counts, limit_rule){
		var count = 0;
		//noinspection JSUnresolvedVariable
		if(!limit_rule.limit_obj) throw new Error('invalid limit_rule');
		for(var i in limit_rule['limit_obj']){
			var limit_obj = limit_rule['limit_obj'][i];
			//某考点某科目人数
			if(limit_obj.subject_code){
				count += counts.subjectCount[limit_obj.exam_site_code][limit_obj.subject_code];
			}
			//考点总人数
			else{
				count += counts.sitesCount[limit_obj.exam_site_code];
			}
		}
		//noinspection JSUnresolvedVariable
		return count < limit_rule.limitNum;

	};
	exports.checkCount = checkCount;

	//插入记录
	exports.insertInfo = function(data_in, callback) {
		var err = check(data_in);
		if (err != null) callback(err);
		else {
			//过滤掉无用的属性
			data_in = _.pick(data_in, _.keys(data_schema));
			//事物流程
			var insert_transaction = [
				//开始事务
				function(cb) {
					con.beginTransaction(function(err) {
						cb(err);
					});
				},
				//按规则检查
				function(cb){
					getStatistics(function(err,res){
						if(err) cb(err);
						else{
							var overflow = [];
							for(var i in limit_rules){
								if(!checkCount(res,limit_rules[i])) overflow.push(i);
							}
							if(overflow.length > 0) cb({error_type: 'overflow', err_info: 'Conflict in rule:' + overflow.join(',')});
							else cb();
						}
					});
				},
				//重复检查
				function(cb) {
					repeatCheck(data_in.id_number, function(err, res) {
						if (err) cb(err);
						else {
							if (res === 'false') cb({error_type: 'exist', err_info: 'exist'});
							else {
								
							}
						}
					});
                },
                //插入数据
                function (cb) { 
                    var sql = 'INSERT INTO ' + db_config.table + ' SET ?';
                    con.query(sql, data_in, function (err) {
                        if (err) cb(err);
                        else cb();
                    });
                },
                //按规则检查
                function (cb) {
                    getStatistics(function (err, res) {
                        if (err) cb(err);
                        else {
                            var overflow = [];
                            for (var i in limit_rules) {
                                if (!checkCount(res, limit_rules[i])) overflow.push(i);
                            }
                            if (overflow.length > 0) cb({ error_type: 'overflow', err_info: 'Conflict in rule:' + overflow.join(',') });
                            else cb();
                        }
                    });
                },
			];
			//执行
			async.series(insert_transaction, function(err) {
				if (err) {
					//console.log(err);
					con.rollback(
							(function() {
								return function(error) {
									if (error) throw error;
									else {
										//console.log('rollback');
										callback(err);
									}
								};
							})()
					);
				} else {
					//console.log('succeed');
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

})();
