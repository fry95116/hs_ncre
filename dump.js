(function(){
    var sch = require('node-schedule');
    var sub_process = require('child_process');
    var fs = require('fs');

    var LocalConfig = require('./config/LocalConfig.json');
    var path = LocalConfig.MySQLPath;
    var db_config = LocalConfig.db_config;

    var j = sch.scheduleJob('* * * * * *',function(){
        sub_process.exec('"' + path + '\\bin\\mysqldump" -quick -u ' + db_config.user + ' -p' + db_config.password + ' ' + db_config.database +' ' + db_config.table,function(err,stdout){
            var fn = new Date(Date.now()).toString();
            //fn.replace(/[ ]/,'_');
            fn = fn.replace(/\s+/g, '-');

            fs.writeFile('./dump/' + fn, stdout, function (err) {
                if (err) throw err;
                console.log('dumped'); //文件被保存
            });
        });
    });

})();