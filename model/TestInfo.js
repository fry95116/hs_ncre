/**
 * 数据合法性检查与数据库操作
 * @module dbo
 * */

(function() {
    var mysql = require('mysql'),
        _ = require('lodash'),
        Promise = require('bluebird'),
        xlsx = require('xlsx'),

        user_config = require('./../user_config'),

        db_config = user_config.db_config,
        table_names = user_config.table_names,


        log = require('../Logger').getLogger();

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;



    var con;
    //以下代码用于维持mysql的连接
    //后期可以考虑连接池
    function handleDisconnect() {

        con = mysql.createConnection(db_config); // 连接数据库

        con.connect(function(err) {
            if(err) {
                if(err.code = 'ECONNREFUSED'){
                    log.error('场次信息_数据库连接:无法连接到数据库，请检查数据库配置',{err:err});
                }
                else{
                    log.error('场次信息_数据库连接:未知错误',{err:err});
                }
            }
            else log.info('场次信息_数据库连接_成功。');
        });
        con.on('error', function(err) {
            if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                log.error('场次信息_数据库连接_中断.重连中...',{err:err});
                handleDisconnect();
            } else {
                throw err;
            }
        });
    }
    handleDisconnect();

    /**
     * 开始事务
     * */
    function begin() {
        return new Promise(function(resolve,reject){
            con.beginTransaction(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }
    exports.begin = begin;
    /**
     * 回滚事务
     * */
    function rollback() {
        return new Promise(function(resolve,reject){
            con.rollback(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }
    exports.rollback = rollback;
    /**
     * 提交事务
     * */
    function commit() {
        return new Promise(function(resolve,reject){
            con.commit(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }
    exports.commit = commit;
    /**
     * 重复检查
     * @param {int} id_number 证件号
     * @return {Promise} Promise对象,resolve时传入counts */
    function repeatCheck(id_number) {
        return new Promise(function(resolve,reject){
            con.query(
                'SELECT count(1) AS \'count\' FROM ' + table_names.testInfo +
                ' WHERE id_number=?',
                id_number,
                function(err, res) {
                    if (err) reject(err);
                    else if (res[0].count > 0) reject(new Error('该证件号已经存在'));
                    else resolve();
                }
            );
        });
    }
    exports.repeatCheck = repeatCheck;

    /**
     * 插入记录
     * @param {object} data_in 输入的数据
     * @param {object} index 索引，用于错误定位
     * @return {Promise} Promise对象*/
    function insertTestInfo(data_in,index) {
        return new Promise(function(resolve,reject){
            var cols = ['id_number', 'name', 'testRoom_number', 'batch_number'];
            //过滤掉无用的属性
            data_in = _.pick(data_in, cols);
            for(var i = 0; i < cols.length; ++i){
                if(_.isUndefined(data_in[cols[i]])){
                    reject(new Error('非法的数据：缺少数据项' + cols[i] + '(行数：' + (index+1) + ')'));
                    return;
                }
            }


            // 将身份证中可能出现的x变成大写字母
            data_in.id_number = data_in.id_number.toUpperCase();

            //重复检查
            repeatCheck(data_in.id_number)
                .then(function(){
                    //组装key-value对
                    data_in = _.map(data_in,function(v,k){
                        return con.escapeId(k) + '=' + con.escape(v);
                    }).join(',');

                    //插入数据
                    var sql = 'INSERT INTO ' + table_names.testInfo + ' SET ' + data_in;
                    con.query(sql, function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                })
                .catch(function(err){
                    err.message += '(行：' + (index+1) + ')';
                    reject(err);
                });


        });
    }
    exports.insertTestInfo = insertTestInfo;

    /**
     * 查询记录
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

    function selectTestInfo(option){
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
            var cols = ['id_number', 'name', 'testRoom_number', 'batch_number'];

            opt = _.extend(opt,option);
            opt.table = table_names.testInfo;
            opt.searchText = _.trim(opt.searchText);

            //option合法性检查
            if(!_.includes(cols,opt.searchBy))  opt.searchBy = '';
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
    exports.selectTestInfo =selectTestInfo;
    /**
     * 更新记录
     * @param {string} id_number 证件号
     * @param {object} updateData 要更新的数据
     * */

    function updateTestInfo(id_number,updateData){
        return new Promise(function(resolve,reject){

            //数据检查
            var cols = ['name', 'testRoom_number', 'batch_number'];
            var newData = _.pick(updateData,cols);


            //组装key-value对
            newData = _.map(newData,function(v,k){
                return con.escapeId(k) + '=' + con.escape(v);
            }).join(',');

            //数据更新
            var sql = 'UPDATE ' + table_names.testInfo + ' SET ' + newData + 'WHERE id_number=?;';
            con.query(sql, id_number, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

    }
    exports.updateTestInfo = updateTestInfo;
        /**
     * 删除记录
     * @param {string} id_number 证件号
     * */
    function deleteTestInfo(id_number){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.testInfo + ' WHERE id_number=?;';
            con.query(sql, id_number, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    exports.deleteTestInfo = deleteTestInfo;

    /**
     * 删除全部记录
     * */
    function deleteAllTestInfo(){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.testInfo + ';';
            con.query(sql, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    exports.deleteAllTestInfo =deleteAllTestInfo;


    /**
     * 导入黑名单
     * @param {string} type 文件类型
     * */
    exports.importTestInfo = function (type) {
        type = type.toLowerCase();

        if(type === 'xls' || type === 'xlsx') return importXLSX;
        //else if(type === 'csv') return importCSV;
        //else if(type === 'xml') return importXML;
        //else if(type === 'json') return importJSON;
    };

    var mapping = {
        ZJH:'id_number',
        XM:'name',
        KCH:'testRoom_number',
        PCH:'batch_number'
    };

    function num2ColName(Num){
        var dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if(Num < 26) return dict[Num];
        else return num2ColName(Math.floor(Num/26) - 1,dict) + dict[Num % 26];
    }

    function colName2Num(str){
        var dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return _.reduce(str,function(memo,val,index){
            return memo * 26 + (_.findIndex(dict,function(el){
                return el === val;
            }) + 1);
        },0) - 1;
    }

    function importXLSX(filepath){
        return new Promise(function (resolve, reject) {

            var workbook = xlsx.readFile(filepath);
            var sheet = workbook.Sheets[workbook.SheetNames[0]];

            //替换
            var count_cols = 0;
            if(!_.isUndefined(sheet['!range'])) count_cols = sheet['!range'].e.c;
            else if(!_.isUndefined(sheet['!ref'])){
                count_cols = colName2Num(sheet['!ref'].match(/^[A-Z]+\d+:([A-Z]+)\d+$/)[1]);
            }

            for(var i = 0; i < count_cols; ++i){
                var addr = num2ColName(i) + '1';
                var cell = sheet[addr];
                if(!_.isUndefined(cell)){
                    if(!_.isUndefined(mapping[cell.v])) cell.v = mapping[cell.v];
                    if(!_.isUndefined(mapping[cell.w])) cell.w = mapping[cell.w];
                }

            }

            var data = xlsx.utils.sheet_to_json(sheet);

            begin()
                .then(function(){return data})
                .mapSeries(insertTestInfo)
                .then(commit)
                .then(function(){
                    resolve();
                })
                .catch(function(err){
                    rollback().then(function(){
                        reject(err);
                        //导入失败
                    }).catch(function(err){
                        //导入失败
                        reject(err);
                    });
                })
        });

    }

})();
