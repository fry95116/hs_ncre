(function() {
  var codeRef = require('./tr').codeRef,
    _ = require('underscore');

  module.exports = {
    exam_site_code: /^\d+$/,  // 仅仅检测非空，特殊验证在外面做
    name: /^...*/,
    sex: new RegExp('^' + _.map(codeRef.sex,function(o){return o.code}).join('$|^') + '$'),
    birthday: /^([1-9]\d{3})(0\d|1[012])([0][1-9]|[12]\d|3[01])$/,
    id_type: new RegExp('^' + _.map(codeRef.id_type,function(o){return o.code}).join('$|^') + '$'),
    id_number: /^.+$/,
    nationality: new RegExp('^' + _.map(codeRef.nationality,function(o){return o.code}).join('$|^') + '$'),
    career: new RegExp('^' + _.map(codeRef.career,function(o){return o.code}).join('$|^') + '$'),
    degree_of_education: new RegExp('^' + _.map(codeRef.degree_of_education,function(o){return o.code}).join('$|^') + '$'),
    training_type: new RegExp('^' + _.map(codeRef.training_type,function(o){return o.code}).join('$|^') + '$'),
    subject_code: /^\d+$/,  // 仅仅检测非空，特殊验证在外面做
    examSite_subject_code: /^.+$/,  // 仅仅检测非空，特殊验证在外面做
    post_code: /^\d*$/,
    address: /^.*$/,
    email: /^$|^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
    phone: /^\d+$/,
    remark: /^.+$/
  }
})();
