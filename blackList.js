/**
 * Created by tom smith on 2017/2/3.
 */

var fs = require('fs'),
    _ = require('lodash'),
    csv2json = require('csvtojson'),
    mem_store = require('./config/blacklist.json'),
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

//获取黑名单
exports.get = function () {
    return new Promise(function (resolve, reject) {
        resolve(mem_store);
    });
};

exports.add = function (data_in) {
    return new Promise(function (resolve, reject) {
        if (data_in.name && data_in.id_number) {
            //重复检查
            if (_.find(mem_store, function (v) {
                    return v.id_number == data_in.id_number
                })) {
                reject(new Error('该证件号已存在'));
                return;
            }
            //对齐省份证号的x为小写x
            data_in.id_number = data_in.id_number.toLowerCase();
            //添加
            mem_store.push(_.pick(data_in, ['name', 'id_number']));
            //同步到文件
            fs.writeFile(__dirname + '/config/blackList.json', JSON.stringify(mem_store), function (err) {
                if (err) reject(err);
                else resolve();
            });
        }
        else reject(new Error('invalid data'));
    });
};

exports.delete = function (id_number) {
    return new Promise(function (resolve, reject) {
        //删除
        _.remove(mem_store, function (v) {
            return v.id_number == id_number;
        });
        //同步到文件
        fs.writeFile(__dirname + '/config/blackList.json', JSON.stringify(mem_store), function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};

exports.importCSV = function (filepath) {
    return new Promise(function (resolve, reject) {
        var tid = _.now();
        var streamIn = csv2json().fromStream(fs.createReadStream(filepath));

        var errHandler = function(err) {
            streamIn.removeAllListeners();
            _.remove(mem_store, function (v) {
                return v.tid == tid
            });
            reject(err);
        };

        streamIn.on('record_parsed', function (val, row, line) {
            //数据合法性检查
            if (!(val.id_number && val.name))
                errHandler(new Error('line(' + line + '):无效的数据'));
            //重复检查
            else if (_.find(mem_store, function (v) {return v.id_number == val.id_number})) {
                errHandler(new Error('line:(' + line + '):该证件号已存在'));
            }
            //添加过程
            else{
                val.tid = tid;                                              //添加事务号
                val.id_number = val.id_number.toLowerCase();                //对齐省份证号的x为小写x
                mem_store.push(_.pick(val, ['name', 'id_number', 'tid']));     //添加
            }
        });

        streamIn.on('done',function(){
            _.findLast(mem_store,function(v){
                if(v.tid) {
                    delete v.tid;
                    return false;
                }
                else return true;
            });
            resolve();
        });

        streamIn.on('error',reject);
    });

};
//添加黑名单




