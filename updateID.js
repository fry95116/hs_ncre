/**
 * Created by tastycarb on 2017/5/17.
 */
(function(){
    var uuid = require('node-uuid'),
        Promise = require('bluebird'),
        redis_config = require('./config/LocalConfig.json').redis_config,
        redis = require('redis').createClient(redis_config);

    var timeOut = 5 * 60; //5分钟

    function create(id_number){
        return new Promise(function(resolve,reject){
            var token = uuid.v4().replace(/-/g, '');
            redis.setex('update:' + token, timeOut , id_number ,function(err){
                if(err) reject(err);
                else resolve(token)
            });
        });
    }


    function check(requestID,id_number){
        return new Promise(function(resolve,reject){
            redis.get('update:' + requestID, function (err, reply){
                if(err) reject(err);
                else if(reply === id_number) resolve();
                else reject(new Error('无效的updateID'));
            });
        });
    }


    function remove(requestID){
        return new Promise(function(resolve,reject){
            redis.del('update:' + requestID, function (err, reply){
                if(err) reject(err);
                else resolve();
            });
        });
    }


    exports.create = create;
    exports.check = check;
    exports.remove = remove ;
})();