(function() {
  var tr = require('./tr'),
    _ = require('underscore');

  module.exports = {
    exam_site_code: new RegExp('^' + _.keys(tr.exam_site_code).join('$|^') +
      '$'),
    name: /^...*/,
    sex: new RegExp('^' + _.keys(tr.sex).join('$|^') + '$'),
    birthday: /^([1-9]\d{3})(0\d|1[012])([0][1-9]|[12]\d|3[01])$/,
    id_type: new RegExp('^' + _.keys(tr.id_type).join('$|^') + '$'),
    id_number: /^.+$/,
    nationality: new RegExp('^' + _.keys(tr.nationality).join('$|^') + '$'),
    career: new RegExp('^' + _.keys(tr.career).join('$|^') + '$'),
    degree_of_education: new RegExp('^' + _.keys(tr.degree_of_education).join(
      '$|^') + '$'),
    training_type: new RegExp('^' + _.keys(tr.training_type).join('$|^') +
      '$'),
    subject_code: new RegExp('^' + _.keys(tr.subject_code).join('$|^') +
      '$'),
    post_code: /^\d*$/,
    address: /^.*$/,
    email: /^$|^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
    phone: /^\d+$/,
    remark: /^.+$/
  }
})();
