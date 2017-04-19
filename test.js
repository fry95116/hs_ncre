
var winston = require('winston');
var winstonError = require('winston-error');
var error_s = require('serialize-error');

console.log(error_s(new Error('error test')));
/*
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: 'log.log' })
    ]
});

winstonError(logger);

for(var i = 0; i < 10; ++i)
    logger.info('message info ' + i,{metaDataKey:'this is metaData',metaDataKey2:'this is metaData'});
logger.error('failed',{error:new Error('error test')});
*/

/*
winston.query({from:new Date() - 1000*60*1,until:new Date()},function(err,res){
    if(err){throw err;}
    console.log(res);
});*/
