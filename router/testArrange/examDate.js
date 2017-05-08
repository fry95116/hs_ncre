/**
 * Created by tastycarb on 2017/5/7.
 */
/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        user_config = require('../../user_config'),
        _ = require('lodash');

    router.get('/',function(req,res,next){
        res.setHeader('Content-type','application/json');
        res.send(user_config.examDate);
    });

    router.post('/', bodyParser.urlencoded({extended: true}), function (req, res) {

        var data_in = _.pick(req.body,['enterStart','enterEnd','printStart','printEnd','queryStart','queryEnd']);
        _.forIn(data_in, function(value, key) {
            var date = new Date(value);
            if(date) data_in[key] = Date.parse(date);
            else {
                res.status(400).send('非法的日期格式(' + key + ')');
                return false;
            }
        });

        if(data_in.enterStart > data_in.printStart)
            res.status(400).send('报名开始时间应早于准考证打印开始时间');
        else if(data_in.queryStart < Math.max(data_in.enterEnd,data_in.printEnd))
            res.status(400).send('分数应在报名和准考证打印都结束后开始');
        else{
            user_config.examDate = data_in;
            res.send('设置成功');
        }
    });

    module.exports = router;

})();
