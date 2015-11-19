(function(){
    var sch = require('node-schedule');
    var sub_process = require('child_process');
    var fs = require('fs');

    var user_config = require('./user_config');
    var path = user_config.path;
    var db_config = user_config.db_config;

    console.log('"' + path.mysql + '\\bin\\mysqldump" -quick -u ' + db_config.user + ' -p' + db_config.password + ' ' + db_config.database +' ' + db_config.table);
    sub_process.exec('"' + path.mysql + '\\bin\\mysqldump" -quick -u ' + db_config.user + ' -p' + db_config.password + ' ' + db_config.database +' ' + db_config.table,function(err,stdout,stderr){
        var fn = new Date(Date.now()).toString();
        fn.replace(/[ ]/,'_');

        fs.writeFile('./dump/' + fn, stdout, function (err) {
            if (err) throw err;
            console.log('It\'s saved!'); //文件被保存
        });
    });
    /*var j = sch.scheduleJob('* * * * * *',function(){

    });*/

})();