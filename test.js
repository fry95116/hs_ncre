var Promise = require('bluebird');

function iter(t){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            console.log(t);
            if(t == 3) reject(new Error('error'));
            else resolve();
        },500);
    });
}

function begin(){
    return new Promise(function(resolve){
        resolve();
    });
}
begin().then(function(){
    return [1,2,3,4,5,6,7];
}).mapSeries(iter);