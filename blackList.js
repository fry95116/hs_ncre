/**
 * Created by tom smith on 2017/2/3.
 */

var fs = require('fs'),
    _ = require('lodash'),
    csv = require('csv'),
    xlsx = require('xlsx'),
    lowdb = require('lowdb'),
    mem_store = lowdb('./config/blacklist.json'),
    Promise = require('bluebird');

//身份证校验算法
var getIdCardInfo = function (cardNo) {
    var info = {
        isTrue: false,
        year: null,
        month: null,
        day: null,
        isMale: false,
        isFemale: false
    };
    if (!cardNo || 18 != cardNo.length) {
        info.isTrue = false;
        return info;
    }

    if (18 == cardNo.length) {
        var year = cardNo.substring(6, 10);
        var month = cardNo.substring(10, 12);
        var day = cardNo.substring(12, 14);
        var p = cardNo.substring(14, 17);
        var birthday = new Date(year, parseFloat(month) - 1,
            parseFloat(day));
        // 这里用getFullYear()获取年份，避免千年虫问题
        if (birthday.getFullYear() != parseFloat(year)
            || birthday.getMonth() != parseFloat(month) - 1
            || birthday.getDate() != parseFloat(day)) {
            info.isTrue = false;
            return info;
        }
        var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];// 加权因子
        var Y = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];// 身份证验证位值.10代表X
        // 验证校验位
        var sum = 0; // 声明加权求和变量
        var _cardNo = cardNo.split("");
        if (_cardNo[17].toLowerCase() == 'x') {
            _cardNo[17] = 10;// 将最后位为x的验证码替换为10方便后续操作
        }
        for (var i = 0; i < 17; i++) {
            sum += Wi[i] * _cardNo[i];// 加权求和
        }
        i = sum % 11;// 得到验证码所位置
        if (_cardNo[17] != Y[i]) {
            return info.isTrue = false;
        }
        info.isTrue = true;
        info.year = birthday.getFullYear();
        info.month = birthday.getMonth() + 1;
        info.day = birthday.getDate();
        if (p % 2 == 0) {
            info.isFemale = true;
            info.isMale = false;
        } else {
            info.isFemale = false;
            info.isMale = true
        }
        return info;
    }
    return info;
};

/** 获取黑名单 */
exports.get = function () {
    return new Promise(function (resolve, reject) {
        resolve(mem_store.get('blackList').value());
    });
};

/** 添加黑名单项
 * @param {object} data_in 黑名单项 */
exports.add = function (data_in) {
    return new Promise(function (resolve, reject) {
        if (data_in.id_number) {
            //重复检查
            if (mem_store.find(function (v) {return v.id_number == data_in.id_number}).value()) {
                reject(new Error('该证件号已存在'));
                return;
            }
            //对齐省份证号的x为小写x
            data_in.id_number = data_in.id_number.toLowerCase();
            //添加
            mem_store.get('blackList').push(_.pick(data_in, ['name', 'id_number'])).value();
        }
        else reject(new Error('无效的数据'));
    });
};
/**
 * 删除黑名单项
 * @param {string} id_number 要删除的项的证件号 */
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
            //关闭流
            parser.removeAllListeners();
            //回滚
            mem_store.get('blackList').remove(function (v) {
                return v.tid == tid
            });
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
                var value = _.zipObject(keys,row);
                //合法性检查
                if(!value.id_number) errHandler(new Error('line:(' + parser.lines + '):无效的数据'));
                //重复检查
                else if (mem_store.get('blackList').find(function (v) {return v.id_number == value.id_number}).value()) {
                    errHandler(new Error('line:(' + parser.lines + '):该证件号已存在'));
                }
                //添加过程
                else{
                    value.tid = tid;                                    //添加事务号
                    value.id_number = value.id_number.toLowerCase();    //对齐省份证号的X为小写x
                    mem_store.get('blackList').push(value).value();     //添加
                }
            }
        });


        parser.on('end',function(){
            mem_store.get('blackList').findLast(function(v){
                if(v.tid) {
                    delete v.tid;
                    return false;
                }
                else return true;
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
        var line = 1;
        _.find(data,function(row){
            //合法性检查
            if(!(_.has(row, 'name') && _.has(row, 'id_number'))){
                err = new Error('line:(' + line + '):无效的数据');
                return true;
            }
            //重复检查
            else if (mem_store.get('blackList').find(function (v) {return v.id_number == row.id_number}).value()) {
                err = new Error('line:(' + line + '):该证件号已存在');
                return true;
            }
            else {
                var repeatWith = _.findIndex(data,function (v,index) {
                    return v.id_number === row.id_number && index != line - 1;
                });
                if (repeatWith !== -1) {
                    err = new Error('line:(' + line + '):该证件号与line(' + (repeatWith + 1) + ')重复');
                    return true;
                }
                else{
                    line++;
                    return false;
                }
            }
        });

        if(err) reject(err);
        else{
            var t = mem_store.get('blackList');
            _.forEach(data,function(row){
                t.push(_.pick(row, ['name', 'id_number'])).value();
            });
            resolve();
        }
    });

}

function importXLS(filepath){
    return
    var workbook = xlsx.readFile('./tempData/import/Book1.xlsx');
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}

/**
 * 导入黑名单
 * @param {string} type 文件类型 */
exports.import = function (type) {
    if(type === 'csv') return importCSV;
    else if(type === 'xls' || type === 'xlsx') return importXLSX;
};
//添加黑名单




