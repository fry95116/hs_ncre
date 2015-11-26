var index = require('./index_node');
var config = require('./config.json');

/*index.stopService("FrontService",function(err){
 if(err) console.log(err);
 else console.log('stop');
 });*/

console.log('This platform is ' + process.platform);
console.log(__dirname);
console.log(AbsolutePath(__dirname,'../fillout.js'));
/**
 * @return {string}
 */
function AbsolutePath(base,rpath){
    var basepath = base.split(/[\\/]/);
    //windows下根目录从盘符开始算
    var root = process.platform == 'win32' ? basepath.shift() : '/';
    var relpath = rpath.split(/[\\/]/);

    for (var i in relpath){
        if(relpath[i] == '.') continue;
        else if(relpath[i] == '..') basepath.pop();
        else basepath.push(relpath[i]);
    }

    basepath.unshift(root);

    if(process.platform == 'win32') return basepath.join('\\');
    else return basepath.join('/');
}


/*
 index.getServiceState(function(err,res){
 console.log(err);
 console.log(res);
 });
 */