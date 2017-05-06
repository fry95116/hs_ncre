var _ = require('lodash');
var Promise = require('bluebird');

function test(con){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            if(con.msg === 30) reject(new Error('error'),con);
            console.log(con.msg);
            con.msg += 1;
            resolve(con);
        },500);
    })
}

test({msg:0})
    .then(test)
    .then(test)
    .then(test)
    .then(test)
    .then(test)
    .then(test)
    .then(test)
    .then(test)
    .catch(function(err){
        console.error(err);
        console.log(con);
    })
    .finally(function(con){
        console.log(con + 'closed');
    });

