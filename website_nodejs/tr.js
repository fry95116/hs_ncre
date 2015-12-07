(function () {

    var _ = require("underscore");
    var codeRef = require("./config/codeReference.json");

    for(var key in codeRef){
        codeRef[key].findName = function(code){
            var re = _.find(this,function(o){return o.code == code});
            return re ? re.name : null;
        };

        codeRef[key].findCode = function(name){
            var re = _.find(this,function(o){return o.name == name});
            return re ? re.code : null;
        };

        codeRef[key].each = function(cb){
            for(var i = 0; i < this.length; ++i)cb(this[i]);
        };
    }


    module.exports.codeRef = codeRef;
    //在信息查询页面显示的信息结构
    //key是数据库中的字段名
    //value是显示时呈现的栏目名称
    var data_schema_convert = {
        exam_site_code: '考点',
        name: '姓名',
        sex: '性别',
        birthday: '出生日期',
        id_type: '证件类型',
        id_number: '证件号码',
        nationality: '民族',
        career: '职业',
        degree_of_education: '文化程度',
        training_type: '培训类型',
        subject_code: '考试科目',
        post_code: '邮政编码',
        address: '地址',
        email: '电子邮箱',
        phone: '联系电话',
        remark: '备注'
    }
    module.exports.data_schema_convert = data_schema_convert;

    module.exports.tr = function(field){
      return data_schema_convert[field];
    };

})();
