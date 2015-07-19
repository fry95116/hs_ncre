(function() {
  var mysql = require('mysql'),
    async = require('async'),
    db_config = require('./db_config'),
    data_schema = require('./data_schema');

  var con = mysql.createConnection(db_config);

  con.connect();

})();
