var XML_Reader = require('./XML_reader');

var reader = new XML_Reader();
reader.on('item',function(item){
    console.log(item);
});

reader.on('error',function(err){
    console.log(err.message);
    reader.removeAllListeners();
});

reader.on('end',function(){
    console.log('end');
});

reader.fromFile('./test.xml');
