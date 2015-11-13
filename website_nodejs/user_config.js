(function() {
  //数据库连接信息
  exports.db_config = {
    host: 'localhost',
    user: 'root',
    password: 'lishenzhi1214',
    database: 'test',
    table: 'data'
  };
  //计划招生人数
  exports.plan_count = {
    '410067': 100,
    '410084': 200
  };

  //报名信息提交后：显示的信息
  exports.op_res_text = {
    //重复提交
    exist: '提交失败：您已报名,请勿重复提交',
    //报名人数已满
    overflow: '提交失败：名额已满',
    //报名成功
    succeed: '您已报名成功,如要查询报名结果,请返回主页。<br>' +
      '报名成功后,需要考生现场校对信息和缴费,安排如下:<br>' +
      '花园校区考点：6月22日～6月25日8:30-17:00，地点：综合实验楼401。<br>' +
      '龙子湖校区考点：6月22日～6月26日8:30-20:00，地点：实验楼S2一楼101房间。',
    //其他原因
    other_err: '提交失败',
  };

  //在信息查询页面显示的信息结构
  //key是数据库中的字段名
  //value是显示时呈现的栏目名称
  exports.getinfo_items = {
    exam_site_code: '考点',
    name: '姓名',
    sex: '性别',
    id_type: '证件类型',
    id_number: '证件号码', //330182199501160019
    birthday: '生日', //19931214
    nationality: '民族',
    career: '职业',
    degree_of_education: '文化程度',
    training_type: '培训类型',
    subject_code: '考试科目',
    phone: '联系电话',
    post_code: '邮编',
    address: '地址',
    email: '电子邮件',
    remark: '备注'
  };
})();
