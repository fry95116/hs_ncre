(function() {
  var mysql = require('mysql'),
    async = require('async'),
    _ = require('underscore'),
    db_config = require('./user_config').db_config,
    data_schema = require('./data_schema');

  var con = mysql.createConnection(db_config);

  con.connect(function(err) {
    if (err) throw err;
    console.log('db connected');
  });

  //对数据进行检查
  var check = function(data_in) {
    var err = {};
    for (key in data_schema) {
      if (!data_schema[key].test(data_in[key])) {
        err[key] = data_in[key] ? 'invalid data' : 'empty';
      }
    }
    console.log(err);
    if (_.isEmpty(err)) return null;
    return err;
  };

  exports.check = check;

  //人数统计
  var getCount = function(exam_site_code, cb) {
    con.query(
      'SELECT count(*) AS \'count\' FROM ' + db_config.table +
      ' WHERE exam_site_code=?',
      exam_site_code,
      function(err, res) {
        if (err) cb(err);
        else cb(null, res[0].count);
      });
  };

  exports.getCount = getCount;

  //重复检查
  var repeatCheck = function(id_number, cb) {
    con.query(
      'SELECT count(*) AS \'count\' FROM ' + db_config.table +
      ' WHERE id_number=?',
      id_number,
      function(err, res) {
        if (err) cb(err);
        else {
          if (res[0].count > 0) {
            console.log('false');
            cb(null, 'false');
          } else {
            console.log('true');
            cb(null, 'true');
          }
        }
      });
  };
  exports.repeatCheck = repeatCheck;


  //插入记录
  exports.insertInfo = function(data_in, count, callback) {
    var err = check(data_in);
    if (err != null) callback(err);
    else {
      var re;
      //过滤掉无用的属性
      var data_in = _.pick(data_in, _.keys(data_schema));
      //事物流程
      var insert_transaction = [
        //开始事务
        function(cb) {
          con.beginTransaction(function(err) {
            cb(err);
          });
        },
        //人数检查
        function(cb) {
          getCount(data_in.exam_site_code, function(err, res) {
            if (err) cb(err);
            else {
              if (res >= count) cb('overflow');
              else cb();
            }
          });
        },
        //重复检查
        function(cb) {
          repeatCheck(data_in.id_number, function(err, res) {
            if (err) cb(err);
            else {
              if (res === 'false') cb('exist');
              else {
                //插入数据
                var sql = 'INSERT INTO ' + db_config.table +
                  ' SET ?';
                con.query(sql, data_in, function(err, res) {
                  cb(err);
                });
              }
            }
          });
        }
      ];
      //执行
      async.series(insert_transaction, function(err, res) {
        if (err) {
          console.log(err);
          con.rollback(function(error) {
            if (error) throw error;
            else {
              console.log('rollback');
              callback(err);
            }
          });
        } else {
          console.log('succeed');
          con.commit(function(error) {
            if (error) throw error;
            else {
              console.log('rollback');
              callback();
            }
          });
        }
      });
    }
  };

  //查看考生信息
  exports.getInfo = function(id_number, callback) {
    var sql = 'SELECT * FROM data WHERE id_number=?';
    con.query(sql, id_number, function(err, res) {
      if (err) callback(err);
      else if (res.length === 0) callback('empty');
      else callback(null, res);
    });
  };

})();
