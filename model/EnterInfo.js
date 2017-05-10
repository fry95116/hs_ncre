/**
 * 数据合法性检查与数据库操作
 * @module dbo
 * */

(function() {
	var mysql = require('mysql'),
			_ = require('lodash'),
            xlsx = require('xlsx'),
            Promise = require('bluebird'),

			data_schema = require('./../data_schema'),
			user_config = require('./../user_config'),
			db_config = user_config.db_config,
			table_names = user_config.table_names,
			exam_sites = user_config.exam_sites,
			limit_rules = user_config.limit_rules,

            ERR = require('./../ApplicationError'),
            log = require('../Logger').getLogger();

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;



	//var con;
	//以下代码用于维持mysql的连接
	//后期可以考虑连接池
    // function handleDisconnect() {
    //
     //    con = mysql.createConnection(db_config); // 连接数据库
    //
     //    con.connect(function (err) {
     //        if (err) {
     //            if (err.code = 'ECONNREFUSED') {
     //                log.error('报名信息_数据库连接_无法连接到数据库，请检查数据库配置', {err: err});
     //            }
     //            else {
     //                log.error('报名信息_数据库连接_未知错误', {err: err});
     //            }
     //        }
     //        else {
     //            log.info('报名信息_数据库连接_成功。');
     //            setTransactionIsolationLevel();
     //        }
     //    });
     //    con.on('error', function (err) {
     //        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
     //            log.error('报名信息_数据库连接_中断.重连中...', {err: err});
     //            handleDisconnect();
     //        } else {
     //            throw err;
     //        }
     //    });
    // }
    //
    // handleDisconnect();

    //设置事务隔离级别
    function setTransactionIsolationLevel(con){
        //log.info('设置事务隔离级别...');
        con.query('SET session TRANSACTION ISOLATION LEVEL Read committed;',function(err,res){
            if(err) log.error('报名信息_数据库连接_未知错误',{err:err});
            // else{
            //     log.info('设置事务隔离级别成功。');
            //     con.query('select @@TX_ISOLATION;',function(err,res){
            //         if(err) log.error('ERROR:未知错误',{err:err});
            //         else log.info('当前事务隔离级别：' + res[0]['@@TX_ISOLATION']);
            //     });
            // }
        });
    }

    var pool = mysql.createPool(db_config);
    pool.on('connection', setTransactionIsolationLevel);
    log.info('报名信息_创建数据库连接池。');


	//身份证校验算法
    var getIdCardInfo = function(cardNo){
        var info = {
            isTrue : false,
            year : null,
            month : null,
            day : null,
            isMale : false,
            isFemale : false
        };
        if (!cardNo || 18 != cardNo.length) {
            info.isTrue = false;
            return info;
        }

        if (18 == cardNo.length) {
            var year = cardNo.substring(6, 10);
            var month = cardNo.substring(10, 12);
            var day = cardNo.substring(12, 14);
            var p = cardNo.substring(14, 17);
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
            i = sum % 11;// 得到验证码所位置
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
    };

    /** 获取连接 */
    function getConnection(){
        return new Promise(function(resolve,reject){
            pool.getConnection(function(err,con){
                if(err) reject(err);
                else resolve(con);
            });
        });
    }
    exports.getConnection = getConnection;
    /** 断开连接 */
    function release(con){
        return new Promise(function(resolve,reject){
            con.release();
            resolve();
        });
    }
    exports.release = release;



    /** 开始事务 */
    function begin(con) {
        return new Promise(function(resolve,reject){
            con.beginTransaction(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }
    exports.begin = begin;
    /** 回滚事务 */
    function rollback(con) {
        return new Promise(function(resolve,reject){
            con.rollback(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }
    exports.rollback = rollback;
    /** 提交事务 */
    function commit(con) {
        return new Promise(function(resolve,reject){
            con.commit(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }
    exports.commit = commit;

    /**
	 * 对数据合法性进行检查
	 * check函数的同步版本
	 * @param {Object} data_in 输入的数据
	 * @return {Error} 为null时说明没有异常 */
    function checkSync(data_in) {

    	var err = {};

		// 下面的for循环是用正则表达式验证是否合乎规则
		for (var key in data_schema) {
			if (!data_schema[key].test(data_in[key] ? data_in[key]: '')) {
				// 在 data_schema 中的正则表达式已经为可以为空的key做了匹配规则
				// 如果data_in[key]不存在，表明提交的表单object被修改过，有的键被删除，则err[key]设为'not exist'
                // 否则设为'invalid data'
				err[key] = data_in[key] ? '非法的数据' : '不存在';
			}
		}

		// 接下来对特殊的验证做处理

		// 如果使用的是身份证，则对身份证号码合法性校验
		if(typeof err.id_number !== 'undefined' && data_in.id_type == "1") {
			var id_info = getIdCardInfo(data_in.id_number.toString());
			if(!id_info.isTrue) {
				err['id_number'] = '非法的数据';
			}
		}

        // 考点和科目的后端联动验证
		// 考点
		var sitesInfo = _.find(exam_sites,function(v){
			return v.code == data_in.exam_site_code;
		});
		if(typeof sitesInfo === 'undefined') err.exam_site_code = '非法的数据';
        // 科目
		else{
			var subjectInfo = _.find(sitesInfo.subjects,function(v){
				return v.code == data_in.subject_code;
			});
			if(typeof subjectInfo === 'undefined') err.subject_code = '非法的数据';
		}

		if(_.isEmpty(err)) return null;
		else return new ERR.InvalidDataError(JSON.stringify(err));
	}
    exports.checkSync = checkSync;

    /**
	 * 对数据合法性进行检查
     * @param {Object} data_in 输入的数据
     * @return {Promise} Promise对象 */
    function check(data_in){
    	return new Promise(function(resolve,reject){
            var err = checkSync(data_in);
    		if(err) reject(err);
    		else resolve();
		});
	}
    exports.check = check;

    /**
	 * 人数统计（一次性返回所有信息）
     * @param {Object} con 数据库连接
	 * @return {Promise} Promise对象,成功时传入counts */
    function getStatistics(con){
    	return new Promise(function(resolve,reject){
            //组装模板
            var counts = _.reduce(exam_sites,function(memo,site){
                var subjectCount = _.reduce(site.subjects,function(memo,subject){
                    memo[subject.code] = 0;
                    return memo;
                },{});
                memo.sitesCount[site.code] = 0;
                memo.subjectCount[site.code] = subjectCount;
                return memo;
            },{
                sitesCount: {},
                subjectCount: {}
            });
            //查询
            var query_str = 'SELECT exam_site_code AS \'esc\', subject_code AS \'sc\', concat(exam_site_code,subject_code) AS \'esc_sc\',count(concat(exam_site_code,subject_code)) as \'count\'' +
                ' from ' + table_names.enterInfo +
                ' GROUP BY esc_sc;';
            con.query(
                query_str,
                function (err, res) {
                    if (err) reject(err);
                    else {
                    	//统计
                        _.forEach(res,function(v){

                            if(typeof counts.sitesCount[v.esc] !== 'undefined')
                            	counts.sitesCount[v.esc] += v.count;
                            if(typeof counts.subjectCount[v.esc][v.sc] !== 'undefined')
                            	counts.subjectCount[v.esc][v.sc] += v.count;
                        });
                        resolve(counts);
                    }
                }
            );
		});
	}
    exports.getStatistics = getStatistics;

    /**
	 * 重复检查
	 * @param {string|Object} id_number 证件号或者带证件号的对象
     * @param {Object} con 数据库连接
	 * @return {Promise} Promise对象,resolve时传入counts */
    function repeatCheck(con,id_number) {
    	return new Promise(function(resolve,reject){
    	    if(_.isNil(id_number)) {
                reject(new Error('没有证件号'));
                return;
            }
            con.query(
                'SELECT count(1) AS \'count\' FROM ' + table_names.enterInfo +
                ' WHERE id_number=?',
                id_number,
                function(err, res) {
                    if (err) reject(err);
                    else {
                        if (res[0].count > 0) {
                            reject(new ERR.RepeatInfoError('该证件号已经存在'));
                        } else {
                            resolve();
                        }
                    }
                }
            );
		});
	}
    exports.repeatCheck = repeatCheck;

    /**
	 * 内部函数,按规则检查人数
     * @param {Object} data_in 报名信息
	 * @param {Object} counts 由getStatistics获得的人数统计信息
	 * @param {Object} limit_rule 限制规则
	 * @param {bool} equalAllowed 是否允许相等
	 * @return {bool} 检查是否通过 */
    function checkCountSync(counts, limit_rule, equalAllowed){
		equalAllowed = equalAllowed | false;

		var count = 0;
		//noinspection JSUnresolvedVariable
		/*if(_.isNil(limit_rule.limit_obj))
			throw new Error('无效的limit_rule:limit_obj不存在(limit_rule=' + JSON.stringify(limit_rule) + ')');*/
		for(var i in limit_rule['limit_obj']){
			var limit_obj = limit_rule['limit_obj'][i];
            //考点总人数
			if(_.isNil(limit_obj.subject_code)){
                if(_.isNil(counts.sitesCount[limit_obj.exam_site_code]))
                    throw new ERR.CountCheckError('无效的limit_rule:该考点不存在(limit_rule=' + JSON.stringify(limit_rule) + ')');
                else
                    count += counts.sitesCount[limit_obj.exam_site_code];
			}
            //某考点某科目人数
            else{
                if(_.isNil(counts.subjectCount[limit_obj.exam_site_code][limit_obj.subject_code]))
                    throw new ERR.CountCheckError('无效的limit_rule:该考点无该科目(limit_rule=' + JSON.stringify(limit_rule) + ')');
                else
                    count += counts.subjectCount[limit_obj.exam_site_code][limit_obj.subject_code];

			}
		}
		return equalAllowed ? count <= limit_rule.limitNum : count < limit_rule.limitNum;
	}

    /**
	 * 按规则检查人数
     * @param {Object} data_in 报名信息
     * @param {Object} counts 由getStatistics获得的人数统计信息
     * @param {bool} equalAllowed 是否允许相等
	 * @return {Promise} Promise对象 */
    function checkCount(data_in, counts, equalAllowed){
    	return new Promise(function(resolve,reject){
    	    equalAllowed = equalAllowed || false;

    	    //报名信息的合法性检查
            if(_.isNil(data_in.exam_site_code) || _.isNil(data_in.subject_code)){
                reject(new ERR.InvalidDataError('没有考点或学科代码'));
                return;
            }

    	    //限制规则的合法性检查
    	    var invalidRule = _.find(limit_rules,function(limit_rule){
                return !_.isArray(limit_rule.limit_obj);
            });
    	    if(!_.isNil(invalidRule)) {
                reject(new ERR.CountCheckError('无效的limit_rule:limit_obj不存在(limit_rule=' + JSON.stringify(limit_rule) + ')'));
                return;
            }
            //过滤出相关的限制规则
            var limit_rules_accept  = _.filter(limit_rules,function(limit_rule){
                return _.findIndex(limit_rule.limit_obj,function(limit_obj){
                    if(!_.isNil(limit_obj.exam_site_code) && !_.isNil(limit_obj.subject_code))
                        return limit_obj.exam_site_code == data_in.exam_site_code && limit_obj.subject_code == data_in.subject_code;
                    else if(!_.isNil(limit_obj.exam_site_code))
                        return limit_obj.exam_site_code == data_in.exam_site_code;
                    else
                        return false;
                }) !== -1;

            });

    	    try{
                var violateRule = _.find(limit_rules_accept,function(limit_rule){
                    //检查各条规则
                    return !checkCountSync(counts,limit_rule,equalAllowed);
                });
                if(typeof violateRule === 'undefined') resolve();
                else{
                    reject(new ERR.CountOverFlowError(JSON.stringify(violateRule)));
                }
            }
            catch(err){
                reject(err);
            }

        });
	}
    exports.checkCount = checkCount;

    /**
	 * 插入记录
     * @param {Object} con 数据库连接
	 * @param {object} data_in 输入的数据
	 * @return {Promise} Promise对象*/
	function insertInfo(con,data_in) {
		return new Promise(function(resolve,reject){

			//过滤掉无用的属性
            data_in = _.pick(data_in, _.keys(data_schema));

            // 将身份证中可能出现的x变成大写字母
            if (data_in.id_type == 1) {
                data_in.id_number = data_in.id_number.toUpperCase();
            }

            //组装key-value对
            data_in = _.map(data_in,function(v,k){
                return con.escapeId(k) + '=' + con.escape(v);
            }).join(',');

            //插入数据
            var sql = 'INSERT INTO ' + table_names.enterInfo + ' SET ' + data_in;
            con.query(sql, function (err) {
                if (err) reject(err);
                else resolve();
            });
		});
	}
    exports.insertInfo = insertInfo;

    /**
	 * 查询记录
     * @param {Object} con 数据库连接
	 * @param {Object} option 查询参数
	 * @return {Promise} Promise对象,resolve时传入查询结果*/
	/**
	 * 查询参数
	 * @typedef {Object} SelectOption
	 * @property {string} searchBy 搜索的列
	 * @property {string} searchText 搜索内容
	 * @property {bool} strictMode 严格搜索模式
	 * @property {string} sort 排序的列
	 * @property {string} order 排序模式
	 * @property {number} offset 截取上界
	 * @property {number} limit 截取数量
	 * */
	exports.selectInfo = function(con,option){
		return new Promise(function(resolve,reject){
            var opt = {
                searchBy:'',
                searchText:'',
                strictMode:false,
                sort:'',
                order:'ASC',
                offset:0,
                limit: -1
            };
            var cols = _.keys(data_schema);
            cols.push('create_time');
            cols.push('latest_revise_time');

            opt = _.extend(opt,option);
            opt.table = table_names.enterInfo;
            opt.searchText = _.trim(opt.searchText);

            //option合法性检查
            if(!_.includes(cols,opt.searchBy) && opt.searchBy !== 'remark')  opt.searchBy = '';
            if(!_.includes(cols,opt.sort))  opt.sort = '';
            if(opt.order.toUpperCase() != 'DESC') opt.order = 'ASC';

            if(opt.keys){
	            var sql = 'SELECT {{ keys }} FROM `{{ table }}`';				//查询用
            }
            else{
            	var sql = 'SELECT * FROM `{{ table }}`';				        //查询用
            }
            var sql_count = 'SELECT count(id_number) AS `count` FROM `{{ table }}`';	//统计总数用
            //搜索部分
            if(opt.searchBy !== '' && opt.searchText !== ''){
                if(opt.strictMode == 'true'){
                    sql += ' WHERE {{ searchBy }}=\'{{ searchText }}\'';
                    sql_count += ' WHERE {{ searchBy }}=\'{{ searchText }}\'';
                }

                else{
                    sql += ' WHERE {{ searchBy }} LIKE \'%{{ searchText }}%\'';
                    sql_count += ' WHERE {{ searchBy }} LIKE \'%{{ searchText }}%\'';
                }

            }
            //排序部分
            if(opt.sort !== '')
                sql += ' ORDER BY {{ sort }} {{ order }}';
            //限制部分
            if(opt.limit >= 0) sql += ' limit {{ offset }},{{ limit }}';

            sql = _.template(sql + ';')(opt);
            sql_count = _.template(sql_count + ';')(opt);

            //查询过程
            var query_completed = false;
            var re = {};
            //计数
            con.query(sql_count,function(err,res){
                if(err) reject(err);
                else{
                    re.total = res[0].count;
                    if(query_completed) resolve(re);
                    else query_completed = true;
                }
            });
            //查询
            con.query(sql,function(err,res){
                if(err) reject(err);
                else{
                    re.rows = res;
                    if(query_completed) resolve(re);
                    else query_completed = true;
                }
            });

        });
	};

	/**
	 * 更新记录
     * @param {Object} con 数据库连接
	 * @param {string} id_number 证件号
	 * @param {object} updateData 要更新的数据
	 * */
	exports.updateInfo = function(con,id_number,updateData){
	    return new Promise(function(resolve,reject){

	        //获取旧的值
            var sql_select = 'SELECT `exam_site_code`,`subject_code` FROM ' + table_names.enterInfo + ' WHERE `id_number`=?;';
            con.query(sql_select,id_number,function(err,res){
                if(err) reject(err);
                else{
                    var oldData = res[0];
                    //数据检查
                    var newData = _.pick(updateData, _.chain(data_schema).keys().without('id_number').value());
                    for(var key in newData){
                        if (!data_schema[key].test(newData[key])) {
                            reject(new Error('非法的数据'));
                            return;
                        }
                    }

                    //如果需要修改考点代码或者学科代码
                    if(newData.exam_site_code || newData.subject_code){

                        var exam_site_code = newData.exam_site_code || oldData.exam_site_code;
                        var subject_code = newData.subject_code || oldData.subject_code;

                        // 考点和科目的后端联动验证
                        // 考点
                        var sitesInfo = _.find(exam_sites,function(v){
                            return v.code == exam_site_code;
                        });
                        if(typeof sitesInfo === 'undefined') {
                            reject(new Error('非法的数据'));
                            return;
                        }
                        // 科目
                        else{
                            var subjectInfo = _.find(sitesInfo.subjects,function(v){
                                return v.code == subject_code;
                            });
                            if(typeof subjectInfo === 'undefined') {
                                reject(new Error('非法的数据'));
                                return;
                            }
                        }
                    }


                    //组装key-value对
                    newData = _.map(newData,function(v,k){
                        return con.escapeId(k) + '=' + con.escape(v);
                    }).join(',');

                    //数据更新
                    var sql = 'UPDATE ' + table_names.enterInfo + ' SET ' + newData + 'WHERE id_number=?;';
                    con.query(sql, id_number, function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                }
            });
        });

    };

    /**
     * 删除记录
     * @param {Object} con 数据库连接
     * @param {string} id_number 证件号
     * */
    exports.deleteInfo = function(con,id_number){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.enterInfo + ' WHERE id_number=?;';
            con.query(sql, id_number, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    /**
     * 删除全部记录
     * */
    exports.deleteAllInfo = function(con){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.enterInfo + ';';
            con.query(sql, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    /**
     * 导入记录
     * @param {string} type 文件类型
     * */
    exports.importInfo = function (type) {
        type = type.toLowerCase();
        if(type === 'xls' || type === 'xlsx') return importXLSX;
        //else if(type === 'csv') return importCSV;
        //else if(type === 'xml') return importXML;
        //else if(type === 'json') return importJSON;
    };

    function importXLSX(filepath){
        return new Promise(function (resolve, reject) {

            var workbook = xlsx.readFile(filepath);
            var sheet = workbook.Sheets[workbook.SheetNames[0]];

            var data = xlsx.utils.sheet_to_json(sheet);

            getConnection().then(function(con){
                begin(con)
                    .then(function(){return data})
                    .mapSeries(function(row,index){
                        return new Promise(function(resolve,reject){
                            check(row)
                                .then(_.partial(repeatCheck, con, row.id_number))
                                .then(_.partial(insertInfo, con, row))
                                .then(resolve)
                                .catch(function(err){
                                    err.message += '(行号:' + (index+1) + ')';
                                    reject(err);
                                });
                        });
                    })
                    .then(_.partial(commit, con))
                    .then(resolve)
                    .catch(function(err){
                        rollback(con)
                            .then(function(){reject(err);})
                            .catch(function(err){reject(err);});
                    })
                    .finally(_.partial(release,con));

            }).catch(function(err){
                reject(err);
            });

        });

    }

})();
