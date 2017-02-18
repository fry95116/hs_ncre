/**
 * Created by tastycarb on 2017/2/18.
 */
(function(){
    var fs = require('fs'),
        _ = require('lodash'),
        sax = require('sax'),
        events = require('events'),
        util = require('util');

    //继承events.EventEmitter的原型方法
    util.inherits(XML_reader,events.EventEmitter);

    function XML_reader(ids){
        //继承events.EventEmitter的对象方法
        events.EventEmitter.call(this);

        var self = this;

        //
        self.default_ID = {
            node_root:'blackList',
            node_item:'item',
            node_attr:['name','id_number']
        };
        self.id = _.defaults(ids,self.default_ID);

        /**************** DFA部分 ****************/
        var state = 0;
        self.items = 0;
        var obj_temp = {};
        var attr_temp = '';

        var flag_error = true;

        var transformer = [{},{},{},{}];
        //读取开始
        transformer[0]['open:' + self.id.node_root] = function(){
            //console.log('start');
            state = 1;
        };
        //item开始
        transformer[1]['open:' + self.id.node_item] = function(){
            obj_temp = {};
            ++self.items;
            state = 2;
        };
        //attr
        _.forEach(self.id.node_attr,function(attr){
            transformer[2]['open:' + attr] = function(){
                attr_temp = attr;
                state = 3;
            };
            transformer[2]['close:' + attr] = function(){
                attr_temp = '';
            }
        });
        //value
        transformer[3]['text'] = function(text){
            if(attr_temp != '') {
                obj_temp[attr_temp] = text;
                state = 2;
            }
        };
        //item结束
        transformer[2]['close:' + self.id.node_item] = function(){
            //onRowParsed
            self.emit('item',obj_temp);
            state = 1;
        };
        //读取结束
        transformer[1]['close:' + self.id.node_root] = function(){
            state = 0;
        };

        parser = sax.createStream(true);

        parser.on('opentag',function(node){
            if(transformer[state]['open:' + node.name]) transformer[state]['open:' + node.name]();
        });

        parser.on('closetag',function(name){
            if(transformer[state]['close:' + name]) transformer[state]['close:' + name]();
        });

        parser.on('text',function(text) {
            if(transformer[state]['text']) transformer[state]['text'](text);
        });

        parser.on('end',function(){
            self.emit('end');
        });

        parser.on('error', function (err) {
            // unhandled errors will throw, since this is a proper node
            // event emitter.
            //console.error(err);
            if(flag_error) {
                flag_error = false;
                self.emit('error',err);
            }
            // clear the error
            /*this._parser.error = null;
            this._parser.resume();*/
        });
        /************** 公开的方法 **************/

        self.fromFile = function(path){
            fs.createReadStream(path).pipe(parser);
        }
    }

    module.exports = XML_reader;
})();
