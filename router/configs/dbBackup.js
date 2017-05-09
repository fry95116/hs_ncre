/**
 * Created by tastycarb on 2017/2/19.
 */
/**
 * Created by tom smith on 2017/2/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        cron_parser = require('cron-parser'),
        Dump = require('../../model/Dump');


    var user_config = require('../../user_config');


    //获取备份计划
    router.get('/schedule',function(req,res,next){
        res.send(user_config.dump_plan);
    });

    //更新备份计划
    router.put('/schedule',bodyParser.urlencoded({extended:true}),function(req,res){
        //检查表达式
        if(req.body.schedule){
            try{
                cron_parser.parseExpression(req.body.schedule);
                user_config.dump_plan.schedule = req.body.schedule;
                res.send('更新成功');
            }
            catch(err){
                res.status(401).send('无效的crontab表达式。')
            }
        }
        else res.status(400).send('无效的表单数据');
    });


    /******************* 备份列表 *******************/
    //获取备份列表
    router.get('/dumpList',function(req,res,next){
        Dump.selectDumps(req.query)
            .then(function(result){
                res.send(result);
            })
            .catch(function(err){
                req.log.error('备份信息_获取_失败',{err:err});
                res.status(400).send('获取失败');
            });
    });

    //添加备份
    router.post('/dumpList',function(req,res,next){
        Dump.dump()
            .then(function(){
                req.log.info('备份文件_添加_成功');
                res.send('添加成功');
            })
            .catch(function(err){
                req.log.info('备份文件_添加_失败',{err:err});
                res.status(400).send('添加失败');
            });
    });

    //还原
    router.put('/dumpList/:id',function(req,res,next){
        Dump.restore(req.params.id)
            .then(function(){
                req.log.info('备份文件_还原_成功');
                res.send('添加成功');
            })
            .catch(function(err){
                req.log.info('备份文件_还原_失败',{err:err});
                res.status(400).send('添加失败');
            });
    });

    //删除备份
    router.delete('/dumpList/:id',function(req,res,next){
        Dump.deleteDump(req.params.id)
            .then(function(){
                req.log.info('备份文件_删除_成功');
                res.send('删除成功');
            })
            .catch(function(err){
                req.log.info('备份文件_删除_失败',{err:err});
                res.status(400).send('删除失败');
            });
    });


    //删除全部备份
    router.delete('/dumpList',function(req,res,next){
        Dump.deleteAllDumps()
            .then(function(){
                req.log.info('备份文件_清空_成功');
                res.send('删除成功');
            })
            .catch(function(err){
                req.log.info('备份文件_清空_失败',{err:err});
                res.status(400).send('删除失败');
            });
    });

    module.exports = router;
})();