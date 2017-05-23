/**
 * Created by tastycarb on 2017/5/22.
 */

(function(){
    var Promise = require('bluebird'),
        _ = require('lodash'),
        nodemailer = require('nodemailer'),
        stmpConfig = require('./config/LocalConfig.json').stmpConfig,
        ejs = require('ejs');

    exports.sendText = function(to,title,msg){
        return new Promise(function(resolve,reject){

            var transporter = nodemailer.createTransport(stmpConfig);
            transporter.verify(function(err) {
                if (err) reject(err);
                else {
                    var mail = {
                        from: stmpConfig.auth.user,
                        to: to,
                        subject: title,
                        text: msg
                    };
                    transporter.sendMail(mail,function(err){
                        if(err) reject(err);
                        else{
                            transporter.close();
                            resolve();
                        }
                    });
                }
            });
        });

    };

    exports.renderAndSend = function(to,title,filePath,data){
        return new Promise(function(resolve,reject){
            ejs.renderFile(filePath,data,function(err,htmlContent){
                if(err){
                    reject(err);
                    return;
                }
                var transporter = nodemailer.createTransport(stmpConfig);
                transporter.verify(function(err) {
                    if (err){
                        reject(err);
                        return;
                    }
                    var mail = {
                        from: stmpConfig.auth.user,
                        to: to,
                        subject: title,
                        html:htmlContent
                    };
                    transporter.sendMail(mail,function(err){
                        if(err) reject(err);
                        else {
                            transporter.close();
                            resolve();
                        }
                    });
                });
            });
        });
    };

})();