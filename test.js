var _ = require('lodash');
var xlsx = require('xlsx');

var archiver = require('archiver');

var fs = require('fs');
/*
var workbook = xlsx.readFile('ImportTemplate.xlsx');

var sheet = workbook.Sheets[workbook.SheetNames[0]];

sheet['A1'] = {t:'s',v:'test'};
sheet['A4'] = {t:'s',v:'test'};

xlsx.writeFile(workbook, 'out.xlsx');

var output = fs.createWriteStream(__dirname + '/example.zip');
var archive = archiver('zip', {
    store: true // Sets the compression method to STORE.
});

// listen for all archive data to be written
output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
    throw err;
});

// pipe archive data to the file
archive.pipe(output);


// append a file
//archive.file('file1.txt', { name: 'file4.txt' });

// append files from a directory
//archive.directory(__dirname + '/证件照','/');

fs.readdir(__dirname + '/证件照',function(err,files){
    _.each(files,function(fileName,index){
        archive.file(__dirname + '/证件照/test' , { name: 'file4.txt' });
    });
    archive.finalize();
});*/

// finalize the archive (ie we are done appending files but streams have to finish yet)


var enterInfo = require('./model/EnterInfo');

enterInfo.exportInfo();

