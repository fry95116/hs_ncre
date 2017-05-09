(function(){
    var sch = require('node-schedule'),
        _ = require('lodash'),
        log = require('./Logger').getLogger(),

        user_config = require('./user_config'),
        Dump = require('./model/Dump');

    var dumpPlan = sch.scheduleJob(user_config.dump_plan.schedule,function(){
        Dump.dump().then(function(){
            log.info('计划任务_数据库备份_成功');
        }).catch(function(err){
            log.info('计划任务_数据库备份_失败',{err:err});
        });
    });

    var actions = {
        "enterStart": function(){
            log.info('计划任务_报名_开始');
            var newVal = user_config.functionControl;
            newVal.enter = true;
            user_config.functionControl = newVal;
        },
        "enterEnd": function(){
            log.info('计划任务_报名_结束');
            var newVal = user_config.functionControl;
            newVal.enter = false;
            user_config.functionControl = newVal;
        },
        "printStart": function(){
            log.info('计划任务_准考证打印_开始');
            var newVal = user_config.functionControl;
            newVal.print = true;
            user_config.functionControl = newVal;
        },
        "printEnd": function(){
            log.info('计划任务_准考证打印_结束');
            var newVal = user_config.functionControl;
            newVal.print = false;
            user_config.functionControl = newVal;
        },
        "queryStart": function(){
            log.info('计划任务_分数查询_开始');
            var newVal = user_config.functionControl;
            newVal.query = true;
            user_config.functionControl = newVal;
        },
        "queryEnd": function(){
            log.info('计划任务_分数查询_结束');
            var newVal = user_config.functionControl;
            newVal.query = false;
            user_config.functionControl = newVal;
        }
    };

    _.each(user_config.examDate,function(date,actionName){
        date = new Date(date);
        if(date && date > new Date()) sch.scheduleJob(date,actions[actionName]);
    });

    log.info('计划任务设置完成');


})();