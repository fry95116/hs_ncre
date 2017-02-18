/**
 * Created by tom smith on 2017/2/3.
 */

var fs = require('fs'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    csv = require('csv'),
    xlsx = require('xlsx'),
    XML_reader = require('./XML_reader'),
    lowdb = require('lowdb'),
    mem_store = lowdb('./config/blacklist.json');

function checkData(data_in){
    data_in = _.pick(data_in, ['name', 'id_number']);
    if(data_in.id_number && data_in.name) return data_in;
}

function __add(data_in,tid,line){
    data_in = checkData(data_in);
    if (typeof data_in === 'undefined') {
        return new Error('无效的数据');
    }
    //重复检查
    else if (mem_store.get('blackList').find(function (v) {return v.id_number == data_in.id_number;}).value()) {
        if(line) return new Error('line:(' + line + '):该证件号已存在');
        else return new Error('该证件号已存在');
    }
    else{
        //添加过程
        if(tid) data_in.tid = tid;                              //添加tid
        data_in.id_number = data_in.id_number.toLowerCase();    //对齐省份证号的x为小写x
        mem_store.get('blackList').push(data_in).value();       //添加
    }
}

/** 获取黑名单 */
exports.get = function () {
    return new Promise(function (resolve, reject) {
        resolve(mem_store.get('blackList').value());
    });
};

/** 添加黑名单项
 * @param {object} data_in 黑名单项
 * */
exports.add = function (data_in) {
    return new Promise(function (resolve, reject) {
        var err = __add(data_in);
        if(err) reject(err);
        else resolve();
    });
};

/**
 * 导入黑名单
 * @param {string} type 文件类型
 * */
exports.import = function (type) {
    type = type.toLowerCase();

    if(type === 'csv') return importCSV;
    else if(type === 'xls' || type === 'xlsx') return importXLSX;
    else if(type === 'xml') return importXML;
    else if(type === 'json') return importJSON;
};


/**
 * 删除黑名单项
 * @param {string} id_number 要删除的项的证件号
 * */
exports.delete = function (id_number) {
    return new Promise(function (resolve, reject) {
        //删除
        mem_store.get('blackList').remove(function (v) {return v.id_number == id_number;}).value();
        resolve();
    });
};

function importCSV(filepath){
    return new Promise(function (resolve, reject) {
        var tid = _.now();
        var parser = csv.parse();
        var keys = null;

        //错误处理
        var errHandler = function(err) {
            parser.removeAllListeners();                                                    //关闭流
            mem_store.get('blackList').remove(function (v) {return v.tid == tid;}).value(); //回滚
            reject(err);
        };

        parser.on('readable',function(){
            //空行
            var row = parser.read();
            if(row === null) return;
            //header
            else if(parser.lines === 1){
                keys = row;
                if(_.includes(keys,'name') && _.includes(keys,'id_number') && keys.length === 2) return;
                else errHandler(new Error('文件格式有误'));
            }
            //文件主体
            else{
                var data_in = checkData(_.zipObject(keys,row));
                var err = __add(data_in,tid,parser.lines);
                if(err) errHandler(err);
            }
        });


        parser.on('end',function(){
            mem_store.get('blackList').forEachRight(function(v){
                if(v.tid == tid)delete v.tid;
            }).value();
            mem_store.write();
            resolve();
            //同步到文件
        });
        //错误处理
        parser.on('error',reject);
        //建立输入流
        fs.createReadStream(filepath).pipe(parser);
    });

}
function importXLSX(filepath){
    return new Promise(function (resolve, reject) {
        var err = null;

        var workbook = xlsx.readFile(filepath);
        var data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        //
        var tid = _.now();
        var line = 1;
        _.find(data,function(row){
            err = __add(row,tid,line);
            if(err) return true;
            else{
                line++;
                return false;
            }
        });

        if(err){
            //回滚
            mem_store.get('blackList').remove(function (v) {
                return v.tid == tid
            }).value();
            reject(err);
        }
        else {
            mem_store.get('blackList').forEachRight(function(v){
                if(v.tid == tid)delete v.tid;
            }).value();
            mem_store.write();
            resolve();
        }
    });

}
function importXML(filepath){
    return new Promise(function (resolve, reject) {
        var tid = _.now();
        var reader = new XML_reader();

        //错误处理
        var errHandler = function(err) {
            //关闭流
            reader.removeAllListeners();
            //回滚
            mem_store.get('blackList').remove(function (v) {
                return v.tid == tid
            }).value();
            reject(err);
        };

        reader.on('item',function(value){
            var err = __add(value,tid,reader.items);
            if(err) errHandler(err);
        });


        reader.on('end',function(){
            mem_store.get('blackList').forEachRight(function(v){
                if(v.tid == tid)delete v.tid;
            }).value();
            mem_store.write();
            resolve();
            //同步到文件
        });
        //错误处理
        reader.on('error',reject);
        //建立输入流
        reader.fromFile(filepath);
    });
}
function importJSON(filepath){
    return new Promise(function (resolve, reject) {
        var err = null;
        fs.readFile(filepath,function(err,data_in){
            if(err){
                reject(err);
                return;
            }
            try{
                data_in = JSON.parse(data_in);
            }
            catch (err){
                reject(err);
            }
            if(!_.isArray(data_in)){
                reject(new Error('无效的数据格式'));
                return;
            }
            //
            var tid = _.now();
            var line = 1;
            _.find(data_in,function(row){
                err = __add(row,tid,line);
                if(err) return true;
                else {
                    line++;
                    return false;
                }
            });

            if(err){
                //回滚
                mem_store.get('blackList').remove(function (v) {
                    return v.tid == tid
                }).value();
                reject(err);
            }
            else {
                mem_store.get('blackList').forEachRight(function(v){
                    if(v.tid == tid)delete v.tid;
                }).value();
                mem_store.write();
                resolve();
            }
        });

    });
}




