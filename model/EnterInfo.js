/**
 * 数据合法性检查与数据库操作
 * @module dbo
 * */

(function() {
	var _ = require('lodash'),
        fs = require('fs'),
        path = require('path'),

        xlsx = require('xlsx'),
        Promise = require('bluebird'),

        ConnectionPool = require('./ConnectionPool'),
        log = require('../Logger').getLogger(),
        blackList = require('./BlackList'),
        data_schema = require('./../data_schema'),
        user_config = require('./../user_config'),
        table_names = user_config.table_names,
        exam_sites = user_config.exam_sites,
        limit_rules = user_config.limit_rules,

        ERR = require('./../ApplicationError');

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;



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
		if(typeof err.id_number === 'undefined' && data_in.id_type == "1") {
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

                            if(!_.isUndefined(counts.sitesCount[v.esc]))
                            	counts.sitesCount[v.esc] += v.count;
                            if(!_.isUndefined(counts.subjectCount[v.esc][v.sc]))
                            	counts.subjectCount[v.esc][v.sc] += v.count;
                        });
                        resolve(counts);
                    }
                }
            );
		});
	}
    exports.getStatistics = function(){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                getStatistics(con)
                    .then(resolve)
                    .catch(reject)
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('报名信息_获取连接_失败',{err:err});
                reject(err);
            });

        });
    };

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
    exports.repeatCheck = function(id_number){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection()
                .then(function(con){
                    repeatCheck(con,id_number)
                        .then(resolve)
                        .catch(reject)
                        .finally(_.partial(ConnectionPool.release,con));
                })
                .catch(function(err){
                    log.error('报名信息_获取连接_失败',{err:err});
                    reject(err);
                });

        });
    };


    /**
     * 检查是否存在
     * @param {string|Object} id_number 证件号或者带证件号的对象
     * @param {Object} con 数据库连接
     * @return {Promise} Promise对象,resolve时传入counts */
    function exists(con,id_number) {
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
                        if (res[0].count > 0) resolve();
                        else reject(new Error('报名信息不存在'));
                    }
                }
            );
        });
    }
    exports.exists = function(id_number){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection()
                .then(function(con){
                    exists(con,id_number)
                        .then(resolve)
                        .catch(reject)
                        .finally(_.partial(ConnectionPool.release,con));
                })
                .catch(function(err){
                    log.error('报名信息_获取连接_失败',{err:err});
                    reject(err);
                });

        });
    };


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

    exports.addInfo = function(data_in){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                //前期检查
                check(data_in)
                    .then(_.partial(repeatCheck, con, data_in.id_number))
                    .then(_.partial(blackList.check, data_in.id_number))
                    .then(_.partial(getStatistics, con))
                    .then(_.partial(checkCount,data_in, _, false))
                    //添加过程
                    .then(_.partial(ConnectionPool.begin, con))
                    .then(_.partial(insertInfo, con, data_in))
                    .then(_.partial(getStatistics, con))
                    .then(_.partial(checkCount,data_in, _, true))
                    .then(_.partial(ConnectionPool.commit, con))
                    .then(resolve)
                    .catch(function (err) {
                        ConnectionPool.rollback(con)
                            .then(function () {reject(err);})
                            .catch(function (err) {reject(err);})
                    })
                    //释放连接
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('报名信息_获取连接_失败',{err:err});
                reject(err);
            });
        });
    };

    //强制添加
	exports.forceAddInfo = function(data_in){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                //前期检查
                check(data_in)
                    .then(_.partial(repeatCheck, con, data_in.body.id_number))
                    //添加过程
                    .then(_.partial(insertInfo, con, data_in))
                    .then(resolve)
                    .catch(function (err) {reject(err);})
                    //释放连接
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('报名信息_获取连接_失败',{err:err});
                reject(err);
            });
        });
    };


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
    function selectInfo(con,option){
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
	}
    exports.selectInfo = function(option){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                selectInfo(con,option)
                    .then(resolve)
                    .catch(reject)
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('报名信息_获取连接_失败',{err:err});
                reject(err);
            });
        });
    };

	/**
	 * 更新记录
     * @param {Object} con 数据库连接
	 * @param {string} id_number 证件号
	 * @param {object} updateData 要更新的数据
     * @param {object} isAdmin 是否允许对敏感数据的修改
	 * */
	function updateInfo(con,id_number,updateData,isAdmin){
	    return new Promise(function(resolve,reject){

	        if(_.isUndefined(isAdmin)) isAdmin = true;
	        //获取旧的值
            var sql_select = 'SELECT `exam_site_code`,`subject_code` FROM ' + table_names.enterInfo + ' WHERE `id_number`=?;';
            con.query(sql_select,id_number,function(err,res){
                if(err) reject(err);
                else{
                    var oldData = res[0];
                    //数据检查
                    var newData;
                    if(isAdmin === true)
                        newData = _.pick(updateData, _.chain(data_schema).keys().value());
                    else
                        newData = _.pick(updateData,_.chain(data_schema).keys().without('exam_site_code','id_type','id_number','subject_code','email').value());

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
                    var sql = 'UPDATE ' + table_names.enterInfo + ' SET ' + newData + ' WHERE id_number=?;';
                    con.query(sql, id_number, function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                }
            });
        });

    }
    exports.updateInfo = function(id_number,updateData){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                updateInfo(con,id_number,updateData)
                    .then(resolve)
                    .catch(reject)
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('报名信息_获取连接_失败',{err:err});
                reject(err);
            });

        });
    };



    /**
     * 删除记录
     * @param {Object} con 数据库连接
     * @param {string} id_number 证件号
     * */
    function deleteInfo(con,id_number){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.enterInfo + ' WHERE id_number=?;';
            con.query(sql, id_number, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    exports.deleteInfo = function(id_number){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                deleteInfo(con,id_number)
                    .then(resolve)
                    .catch(reject)
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('报名信息_获取连接_失败',{err:err});
                reject(err);
            });
        });
    };

    /**
     * 删除全部记录
     * */
    function deleteAllInfo(con){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.enterInfo + ';';
            con.query(sql, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    exports.deleteAllInfo = function(){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                deleteAllInfo(con)
                    .then(resolve)
                    .catch(reject)
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('报名信息_获取连接_失败',{err:err});
                reject(err);
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

            ConnectionPool.getConnection().then(function(con){
                ConnectionPool.begin(con)
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
                    .then(_.partial(ConnectionPool.commit, con))
                    .then(resolve)
                    .catch(function(err){
                        ConnectionPool.rollback(con)
                            .then(function(){reject(err);})
                            .catch(function(err){reject(err);});
                    })
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                reject(err);
            });

        });

    }


    exports.exportInfo = function(writeStream){
        return new Promise(function(resolve,reject){
            var pos = {
                exam_site_code: 'A',
                name: 'D',
                sex: 'E',
                birthday: 'F',
                id_type: 'G',
                id_number: 'H',
                nationality: 'I',
                career: 'J', degree_of_education: 'K', training_type: 'L',
                subject_code: 'M',
                file_name: 'N',
                post_code: 'O', address: 'P', email: 'Q', phone: 'R',
                remark: 'T'
            };

            var sex_text = {
                1:'男',
                2:'女'
            };

            var sheet = xlsx.utils.aoa_to_sheet([
                ['考点代码','报名流水号','准考证号','考生姓名','性别',
                    '出生日期','证件类型','证件号','民族','职业',
                    '文化程度','培训类型','考试科目代码','照片文件名','邮编',
                    '地址','电子邮件','联系电话','自定义信息','备注']
            ]);
            var range = xlsx.utils.decode_range(sheet['!ref']);

            var wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb,sheet,'报名信息');

            var pos_row = 2;//从第二行开始

            ConnectionPool.getConnection()
                .then(function(con){
                    con.query('SELECT * FROM ' + table_names.enterInfo + ' LEFT JOIN ' + table_names.photo +
                        ' ON ' + table_names.enterInfo + '.id_number=' + table_names.photo + '.id_number ;')
                        .on('error', reject)
                        .on('result', function(row) {
                            //改下性别
                            if(!_.isNil(row.sex)){
                                if(!_.isUndefined(sex_text[row.sex])) row.sex = sex_text[row.sex];
                                else row.sex = '未知(' + row.sex + ')';
                            }

                            _.each(row,function(val,key){
                                if(!_.isUndefined(pos[key])) sheet[pos[key] + pos_row] = {t:'s',v:val};
                            });
                            pos_row++;
                            /*connection.pause();
                             connection.resume();*/
                        })
                        .on('end', function(){
                            range.e.r = Math.max(range.e.r,pos_row - 2);
                            sheet['!ref'] = xlsx.utils.encode_range(range);

                            var exportPath = path.join(__dirname,'../tempData/export');
                            xlsx.writeFileAsync(exportPath,wb,{bookType:'xlsx'},function(){
                                fs.createReadStream(exportPath).pipe(writeStream);
                                resolve();
                            });
                        });
                })
                .catch(reject);

        });
    }

})();
