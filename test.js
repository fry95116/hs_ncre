var nodemailer = require('nodemailer');

var smtpConfig = {
    service: 'QQ',
    auth: {
        user: '386140803@qq.com',
        pass: 'yidlroqcapcocaad'
    }
};
var transporter = nodemailer.createTransport(smtpConfig);

// verify connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

var data = {
    from: '386140803@qq.com',
    to: 'fry95116@126.com',
    subject: 'nodeMailer测试',
    text: 'Plaintext version of the message'
    //html: '<p>HTML version of the message</p>'
};
transporter.sendMail(data,function(err,info){
    if(err) console.log(err);
    else console.log('sended');
});