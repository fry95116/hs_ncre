/**
 * Created by tastycarb on 2017/5/10.
 */
(function(){
    var PDFDocument = require('pdfkit'),
        path = require('path'),
        _ = require('lodash'),

        log =require('../Logger').getLogger(),
        user_config = require('../user_config'),
        table_names = user_config.table_names,
        Promise = require('bluebird'),

        ConnectionPool = require('./ConnectionPool'),
        dbo_enterinfo = require('./EnterInfo'),
        dbo_testinfo = require('./TestInfo'),
        dbo_photo = require('./Photo');
    //字体文件的位置


    var sql_from = 'FROM ' + table_names.enterInfo +
        ' INNER JOIN ' + table_names.testInfo + ' ON ' + table_names.enterInfo + '.id_number=' + table_names.testInfo + '.id_number' +
        ' INNER JOIN ' + table_names.photo + ' ON ' + table_names.enterInfo + '.id_number=' + table_names.photo + '.id_number ';

    var sql_select = 'select examinee_number,' + table_names.enterInfo + '.name,' + table_names.enterInfo + '.id_number,' +
        'subject_code,testRoom_number,batch_number,exam_site_code,enter_number,file_name AS photoFileName ';


    function selectInfo(con,option){
        return new Promise(function(resolve,reject){
            var opt = {
                searchBy:'',
                searchText:'',
                strictMode:false,
                sort:'',
                order:'ASC',
                offset:0,
                limit: -1
            };
            var cols = ['examinee_number', 'name', 'id_number', 'subject_code', 'testRoom_number',
                'batch_number', 'exam_site_code', 'enter_number', 'remark', 'photoFileName'];

            opt = _.extend(opt,option);
            opt.searchText = _.trim(opt.searchText);

            //option合法性检查
            if(!_.includes(cols,opt.searchBy))  opt.searchBy = '';
            if(opt.searchBy === 'id_number' || opt.searchBy === 'name')
                opt.searchBy = table_names.enterInfo + '.' + opt.searchBy;
            if(!_.includes(cols,opt.sort))  opt.sort = '';
            if(opt.order.toUpperCase() != 'DESC') opt.order = 'ASC';

            var sql = sql_select + sql_from;

            var sql_count = 'SELECT count(' + table_names.enterInfo + '.id_number) AS `count` ' + sql_from;	//统计总数用
            //搜索部分
            if(opt.searchBy !== '' && opt.searchText !== ''){
                if(opt.strictMode == 'true'){
                    sql += ' WHERE {{ searchBy }}=\'{{ searchText }}\'';
                    sql_count += ' WHERE {{ searchBy }}=\'{{ searchText }}\'';
                }

                else{
                    sql += ' WHERE {{ searchBy }} LIKE \'%{{ searchText }}%\'';
                    sql_count += ' WHERE {{ searchBy }} LIKE \'%{{ searchText }}%\'';
                }

            }
            //排序部分
            if(opt.sort !== '')
                sql += ' ORDER BY {{ sort }} {{ order }}';
            //限制部分
            if(opt.limit >= 0) sql += ' limit {{ offset }},{{ limit }}';

            sql = _.template(sql + ';')(opt);
            sql_count = _.template(sql_count + ';')(opt);

            //查询过程
            var query_completed = false;
            var re = {};
            //计数
            con.query(sql_count,function(err,res){
                if(err) reject(err);
                else{
                    re.total = res[0].count;
                    if(query_completed) resolve(re);
                    else query_completed = true;
                }
            });
            //查询
            con.query(sql,function(err,res){
                if(err) reject(err);
                else{
                    re.rows = res;
                    if(query_completed) resolve(re);
                    else query_completed = true;
                }
            });

        });
    }

    function getAllInfo(con){
        return new Promise(function(resolve,reject){

            var sql = sql_select + sql_from + ';';

            //查询过程
            con.query(sql,function(err,res){
                if(err) reject(err);
                else resolve(res);
            });
        });
    }

    function getInfoById(con,id_number){
        return new Promise(function(resolve,reject){
            var sql = sql_select + sql_from + 'WHERE '+ table_names.enterInfo + '.id_number=?';
            //查询过程
            con.query(sql,id_number,function(err,res){
                if(err) reject(err);
                else resolve(res);
            });
        });
    }

    /** 查看可以导出的信息 */

    exports.selectInfo = function(option){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection().then(function(con){
                selectInfo(con,option)
                    .then(resolve)
                    .catch(reject)
                    .finally(_.partial(ConnectionPool.release,con));
            }).catch(function(err){
                log.error('准考证信息_获取连接_失败',{err:err});
                reject(err);
            });
        });
    };

    /** 检查是否符合导出条件 */

    function check(id_number){
        return new Promise(function(resolve,reject){
            dbo_enterinfo.exists(id_number)
                .then(_.partial(dbo_testinfo.exists,id_number))
                .then(_.partial(dbo_photo.exists,id_number))
                .then(resolve)
                .catch(reject);
        });
    }
    exports.check = check;




    /**
     * 导出准考证
     * @param {Object} doc PDF文档对象
     * @param {Object} data 准考证信息
     * @param {number} offsetX 证件左上角的X坐标(单位:点)
     * @param {number} offsetY 证件左上角的Y坐标(单位:点)
     * @return {Promise} Promise对象,resolve时传入查询结果*/
    /**
     * 准考证信息
     * @property {string} examinee_number 准考证号
     * @property {string} name 姓名
     * @property {string} id_number 证件号
     * @property {string} subject_code 科目代码
     * @property {string} subject_name 科目名称
     * @property {string} testRoom_number 考场号
     * @property {string} testRoom_loaction 考试地点
     * @property {Date} startTime 考证开始时间
     * @property {number} duration 考试持续时间
     * @property {string} exam_site_code 考点代码
     * @property {string} exam_site_name 考点名称
     * @property {string} enter_number 报名号
     * @property {string} remark 备注
     * @property {string} photoFileName 照片文件名
     * */
    var fontPath_simsun = path.join(__dirname,'./simsun.ttf');
    function drawPassport(doc, data, offsetX, offsetY) {

        data = _.defaults(data,{
            examinee_number:'',
            name:'',
            id_number:'',
            subject_code:'-1',
            testRoom_number:'-1',
            exam_site_code:'-1',
            enter_number:'',
            remark:''
        });

        //考点信息
        var siteInfo = _.find(user_config.exam_sites,function(el){return data.exam_site_code == el.code;});
        if(_.isUndefined(siteInfo)) data.exam_site_name = '未知';
        else {
            data.exam_site_name = siteInfo.name;
            //科目信息
            var subjectInfo = _.find(siteInfo.subjects,function(el){return data.subject_code == el.code;});
            if(_.isUndefined(subjectInfo)){
                data.subject_name = '未知';
                data.duration = 0;
            }
            else{
                data.subject_name = subjectInfo.name;
                data.duration = subjectInfo.duration;
            }

        }

        //考场信息
        var testRoomInfo = _.find(user_config.test_rooms,function(el){return data.testRoom_number == el.code});
        if(_.isUndefined(testRoomInfo)) data.testRoom_location = '未知';
        else {
            data.testRoom_location = testRoomInfo.location;
            //批次信息
            var batchInfo = _.find(testRoomInfo.batchs,function(el){return data.batch_number == el.code;});
            if(_.isUndefined(batchInfo)) data.startTime = new Date(0);
            else data.startTime = new Date(batchInfo.startTime);
        }

        //检查照片是否存在
        data.photoFileName = path.join(user_config.paths.photo,data.photoFileName);

        doc.lineWidth(0.5)
            .moveTo(offsetX + 0, offsetY + 0)
            .lineTo(offsetX + 270, offsetY + 0)
            .lineTo(offsetX + 270, offsetY + 234)
            .lineTo(offsetX + 0, offsetY + 234)
            .lineTo(offsetX + 0, offsetY + 0)
            .stroke();

        doc.font(fontPath_simsun)
            .fontSize(12)
            .text('2017年3月全国计算机等级考试', offsetX + 58, offsetY + 11);

        doc.font(fontPath_simsun)
            .fontSize(16)
            .text('准考证', offsetX + 85, offsetY + 27);

        doc.font(fontPath_simsun)
            .fontSize(10)
            .text('准考证号: ' + data.examinee_number, offsetX + 10, offsetY + 57)
            .text('姓　　名: ' + data.name, offsetX + 10, offsetY + 77)
            .text('证 件 号: ' + data.id_number, offsetX + 10, offsetY + 97)
            .text('科　　目: ' + '(' + data.subject_code + ')' + data.subject_name, offsetX + 10, offsetY + 117)
            .text('考　　场: ' + '(' + data.testRoom_number + ')' + data.testRoom_location, offsetX + 10, offsetY + 137)
            .text('考试时间: ' + data.startTime.toLocaleDateString() +
                '  ' + data.startTime.toLocaleTimeString().replace(/:\d{2}$/,'') + '    (' + data.duration + ')分钟', offsetX + 10, offsetY + 157)
            .text('考点信息: ' + '(' + data.exam_site_code + ')' + data.exam_site_name, offsetX + 10, offsetY + 177)
            .text('报 名 号: ' + data.enter_number, offsetX + 10, offsetY + 197)
            .text('备    注: ' + data.remark, offsetX + 10, offsetY + 217);

        if(data.photoFileName)
            doc.image(data.photoFileName, offsetX + 211, offsetY + 25, { width: 48, height: 64 });
    }

    var fontPath_DFKai = path.join(__dirname,'./DFKai.ttf');
    function drawBack(doc, offsetX, offsetY) {
        doc.lineWidth(0.5)
            .moveTo(offsetX + 0, offsetY + 0)
            .lineTo(offsetX + 270, offsetY + 0)
            .lineTo(offsetX + 270, offsetY + 234)
            .lineTo(offsetX + 0, offsetY + 234)
            .lineTo(offsetX + 0, offsetY + 0)
            .stroke();


        var fontSize = 7.5;
        var padding_side = 3;
        var padding_top = 5;
        var fontStyle = {
            width:270 - 2 * padding_side,
            align:'left',
            lineGap:fontSize * 1.42,
            indent:15
        };
        doc.font(fontPath_DFKai)
            .fontSize(fontSize)
            .text('考 生 注 意 事 项', offsetX+padding_side, offsetY + padding_top,{width:270 - 2 * padding_side,align:'center',lineGap:fontSize});
        doc.text('1．考生凭本人准考证和有效身份证件参加考试，缺一不可。',fontStyle);
        doc.text('2．开考前 15 分钟达到考场，应交验两证。',fontStyle);
        doc.text('3．考生只准携带必要的考试文具（如钢笔，圆珠笔）入场，不得携带任何书籍资料，通讯设备、数据存储设备、智能电子设备等辅助工具及其他未经允许的物品。',fontStyle);
        doc.text('4．开考信号发出后，才能开始答题。',fontStyle);
        doc.text('5．考试开始后，迟到考生禁止入场。',fontStyle);
        doc.text('6．考试中不得以任何方式作弊或帮助他人作弊，违者将按规定给予处罚。',fontStyle);
        doc.text('7. 保持考场安静，不得吸烟，不得喧哗。',fontStyle);
        doc.text('8. 考生可通过教育部考试中心综合查询网（http://chaxun.neea.edu.cn）查询当次成绩和证书信息。',fontStyle);
    }
    function addBackPage(doc,pos){
        doc.addPage({ size: [595, 842],margin:0 });
        _.each(pos,function(pos){
           drawBack(doc,pos[0],pos[1]);
        });
    }
    /** 导出某人的准考证 */

    exports.print = function(id_number,writeStream){
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection()
                .then(function(con){
                    check(id_number)
                        .then(_.partial(getInfoById, con, id_number))
                        .then(function(res){
                            var data = res[0];

                            //构建pdf
                            var doc = new PDFDocument({ autoFirstPage: false });
                            doc.pipe(writeStream);

                            doc.addPage({ size: [595, 842],margin:0 });
                            //画裁剪线
                            doc.lineWidth(1)
                                .moveTo(20, 37)
                                .lineTo(20 + 300, 37)
                                .lineTo(20 + 300, 37 + 264)
                                .lineTo(20, 37 + 264)
                                .lineTo(20, 37)
                                .dash(5, {space: 10})
                                .stroke()
                                .undash();
                            //画正面
                            drawPassport(doc,data, 35, 52);
                            //说明文字
                            doc.fontSize(32)
                                .text('请将此文件双面打印，并沿虚线裁剪。', 25, 320);
                            //画背面
                            doc.addPage({ size: [595, 842],margin:0 });
                            drawBack(doc, 290, 52);
                            // Finalize PDF file
                            doc.end()
                        })
                        .then(resolve)
                        .catch(reject)
                        .finally(_.partial(ConnectionPool.release,con));
                })
                .catch(function(err){
                    log.error('准考证信息_获取连接_失败',{err:err});
                    reject(err);
                });
        });
    };

    /** 导出所有准考证 */
    exports.export = function(writeStream){
        //TODO:改成流式查询
        return new Promise(function(resolve,reject){
            ConnectionPool.getConnection()
                .then(function(con){
                    getAllInfo(con)
                        .then(function(res){

                            /** 构建pdf */
                                //尊考证的位置
                            var positions = [[15, 32],[315, 32],[15, 298],[315, 298],[15, 564],[315, 564]];
                            var positions_back = [[10, 32],[310, 32],[10, 298],[310, 298],[10, 564],[310, 564]];

                            var doc = new PDFDocument({ autoFirstPage: false });
                            doc.pipe(writeStream);


                            _.each(res,function(data,index){
                                var i = index % 6;
                                if(i === 0){
                                    if(index !== 0) addBackPage(doc,positions_back);
                                    doc.addPage({ size: [595, 842],margin:0 });
                                }
                                drawPassport(doc,data, positions[i][0], positions[i][1]);
                            });

                            // Finalize PDF file
                            doc.end()
                        })
                        .then(resolve)
                        .catch(reject)
                        .finally(_.partial(ConnectionPool.release,con));
                })
                .catch(function(err){
                    log.error('准考证信息_获取连接_失败',{err:err});
                    reject(err);
                });
        });
    }

})();