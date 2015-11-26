(function () {
    module.exports = require("./config/codeReference.json");
    //在信息查询页面显示的信息结构
    //key是数据库中的字段名
    //value是显示时呈现的栏目名称
    module.exports.data_schema_convert = {
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

})();
