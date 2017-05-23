/**
 * Created by tastycarb on 2017/2/22.
 */

(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        Promise = require('bluebird'),
        fs = Promise.promisifyAll(require('fs')),
        path = require('path'),
        ejs = require('ejs'),
        _ = require('lodash');

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;


    /** 获取模板 */
    router.get(['/:templateName','/:class/:templateName'],function(req,res){
        if(req.params.class)
            var templatePath = path.join(__dirname,'../../views/frontStage/templates/' + req.params.class + '/' + req.params.templateName + '.ejs');
        else
            var templatePath = path.join(__dirname,'../../views/frontStage/templates/' + req.params.templateName + '.ejs');
        fs.readFileAsync(templatePath)
            .then(function(data){
                if(req.params.templateName === 'mailFormat')
                    data = data.toString().replace(/<%[=-]\s*req_href\s*%>/g,'REQ_HREF');
                res.send(data);
            })
            .catch(function(err){
                res.status(400).send('获取失败');
            });
    });

    /** 更新模板 */
    router.put(['/:templateName','/:class/:templateName'],bodyParser.urlencoded({extended:true}),function(req,res){
        if(_.isUndefined(req.body.content)) res.status(400).send('请传入内容');
        else {
            var absolutePath = '';
            if(req.params.class)
                absolutePath = path.join(__dirname,'../../views/frontStage/templates/' + req.params.class + '/' + req.params.templateName + '.ejs');
            else
                absolutePath = path.join(__dirname,'../../views/frontStage/templates/' + req.params.templateName + '.ejs');

            if(req.params.templateName === 'mailFormat')
                req.body.content = req.body.content.replace(/REQ_HREF|http:\/\/REQ_HREF|https:\/\/REQ_HREF/g,'<%=req_href%>');
            fs.accessAsync(absolutePath)
                .then(function(){
                    return fs.writeFileAsync(absolutePath,req.body.content,{flag:'w'});
                })
                .then(function(){
                    req.log.info('模板_修改_成功');
                    res.send('模板更新成功');
                })
                .catch(function(err){
                    req.log.error('模板_修改_失败',{err:err});
                    res.status(400).send('模板更新失败');
                });
        }
    });

    /** 获取预览 */
    router.post(['/preview/:templateName','/preview/:class/:templateName'],bodyParser.urlencoded({extended:true}),function(req,res){
        if(_.isUndefined(req.body.content)) res.status(400).send('请传入内容');
        else {
            if(req.params.templateName === 'instructions')
                res.render('frontStage/instructions',{
                    isPreview:true,
                    content:req.body.content
                });
            else if(req.params.templateName === 'mailFormat'){
                req.body.content = req.body.content.replace(/REQ_HREF|http:\/\/REQ_HREF|https:\/\/REQ_HREF/g,'http://webstie?id_number=654321&req_id=123456');
                res.send(req.body.content);
            }
            else res.render('frontStage/op_res',{
                isPreview:true,
                content:req.body.content
            });
        }
    });

    module.exports = router;
})();