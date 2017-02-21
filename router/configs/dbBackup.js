/**
 * Created by tastycarb on 2017/2/19.
 */
/**
 * Created by tom smith on 2017/2/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        cron_parser = require('cron-parser');

    var user_config = require('../../user_config');


    //获取备份计划
    router.get('/',function(req,res){
        res.send(user_config.dump_plan);
    });

    //更新备份计划
    router.post('/',bodyParser.urlencoded({extended:true}),function(req,res){
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
    module.exports = router;
})();