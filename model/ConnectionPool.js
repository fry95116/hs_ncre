/**
 * Created by tastycarb on 2017/5/11.
 */
(function(){

    var mysql = require('mysql'),
        Promise = require('bluebird'),

        log = require('../Logger').getLogger(),
        user_config = require('./../user_config'),
        db_config = user_config.db_config;

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

})();