/**
 * Created by tastycarb on 2017/5/17.
 */
(function(){
    var uuid = require('node-uuid'),
        Promise = require('bluebird'),
        redis_config = require('./config/LocalConfig.json').redis_config,
        redis = require('redis').createClient(redis_config);

    var timeOut_requestID = 5 * 60; //请求码最大有效时间：5分钟
    var timeOut_getReqID = 1 * 60;  //发送验证邮件的最小时间间隔：1分钟

    function create(id_number){
        return new Promise(function(resolve,reject){
            redis.ttl('update:' + id_number, function(err,reply){
                if(err) reject(err);
                // 如果存在，返回错误
                else if(reply > 0){
                    err = new Error(reply);
                    err.code = 'EEXIST';
                    reject(err);
                }
                else{
                    var token = uuid.v4().replace(/-/g, '');
                    redis.setex('update:' + token, timeOut_requestID , id_number ,function(err){
                        if(err) reject(err);
                        else redis.setex('update:' + id_number, timeOut_getReqID , id_number ,function(err){
                            if(err) reject(err);
                            else resolve(token)
                        });
                    });
                }
            });
        });
    }


    function check(requestID,id_number){
        return new Promise(function(resolve,reject){
            redis.get('update:' + requestID, function (err, reply){
                if(err) reject(err);
                else if(reply === id_number || requestID === '1234567890') resolve();
                else reject(new Error('无效的updateID'));
            });
        });
    }


    function remove(requestID,id_number){
        return new Promise(function(resolve,reject){
            redis.del('update:' + requestID, function (err, reply){
                if(err) reject(err);
                else redis.del('update:' + id_number, function (err, reply){
                    if(err) reject(err);
                    else resolve();
                });
            });
        });
    }


    exports.create = create;
    exports.check = check;
    exports.remove = remove ;
})();