var _ = require('lodash');
var decompress = require('decompress');
var fs = require('fs');
var images = require('images');

_.each(fs.readdirSync('./testing/testData/证件照'),function(fileName,index){
    fs.readFile('./testing/testData/证件照/' + fileName,function(err,buf){

        var pic = images(buf);
        var width = pic.width(),height = pic.height();
        console.log(index+':' + fileName + '\t' + width + '*' + height);
        if(width / 3 * 4 < height) pic.resize(width,width / 3 * 4);
        else pic.resize(height / 4 * 3,height);
        if(pic.width() >= 144) pic.save('./调整过的图片/' + fileName);
    });
});