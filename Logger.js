/**
 * Created by tastycarb on 2017/4/10.
 */
(function(){
    var path = require('path'),
        winston = require('winston'),
        _ = require('lodash'),
        serializeError = require('serialize-error');

    winston
        .add(winston.transports.File,{filename:path.join(__dirname,'./log/sysLog.log')});
        //.remove(winston.transports.Console);

    function getLogger(baseData){
        baseData = baseData || {};
        return {
            info:function(msg,metaData){
                metaData = metaData || {};
                if(typeof metaData.err !== 'undefined' && metaData.err instanceof Error){
                    metaData['err'] = serializeError(metaData['err']);
                }
                winston.info(msg instanceof Error ? serializeError(msg) : msg,_.assignIn(baseData,metaData));
            },
            error:function(msg,metaData){
                metaData = metaData || {};
                if(typeof metaData['err'] !== 'undefined' && metaData['err'] instanceof Error){
                    metaData['err'] = serializeError(metaData['err']);
                }
                winston.error(msg instanceof Error ? serializeError(msg) : msg,_.assignIn(baseData,metaData));
            },
            child:function(metaData){
                return getLogger(metaData);
            }
        };

    }

    module.exports = {
        getLogger:function(){
            return getLogger();
        },
        getInstance:function(){
            return winston;
        }
    }
})();