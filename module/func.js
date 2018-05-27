var builder = require('botbuilder');
var db = require('./db');
var webshot = require('node-webshot');
var fs = require('fs');
var util = require('util');

var optionsImg = {
    screenSize: {
      width: 320,
      height: 480
    },
    shotSize: {
      width: 'all',
     height: 'all'
    },
    siteType:'html',
    userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
      + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
  };

module.exports = {
    imgToHtmlSend: function (html,session){
        session.sendTyping();
        var renderStream = webshot('<html><body>'+html+'</body></html>', {siteType:'html'});
        renderStream.on('data', function(data) {
            var base64 = Buffer.from(data).toString('base64');
            var contentType = 'image/png';
                    var msg = new builder.Message(session)
                        .addAttachment({
                            contentUrl: util.format('data:%s;base64,%s', contentType, base64),
                            contentType: contentType
                        });
            session.send(msg);          
        });
    },
    imgToHtml: function(html,session){
        return new Promise (function(resolve,reject){
            var renderStream = webshot('<html><style>body {font-family: arial;}table {border-collapse: collapse; background-color: #fff;} td {border: 1px solid #000;padding: 3px 5px;}</style><body>'+html+'</body></html>', optionsImg);
            var bufArr = [];
            renderStream.on('data', function(data) {
                bufArr.push(data);
            });
            renderStream.on('end', function() {
                var buf = Buffer.concat(bufArr);
                var base64 = Buffer.from(buf).toString('base64');
                var contentType = 'image/png';
                        var msg = new builder.Message(session)
                            .addAttachment({
                                contentUrl: util.format('data:%s;base64,%s', contentType, base64),
                                contentType: contentType
                            });  
                resolve(msg);          
            });		
        })
    },
}