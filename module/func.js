var builder = require('botbuilder');
var db = require('./db');
var fs = require('fs');
var util = require('util');
var grabzit = require('grabzit');

var optionsImg = {
    "browserWidth":840, 
    "browserHeight":-1,
    /*"width":-1, 
    "height":-1,*/
    "format":"png"
};

module.exports = {
    imgToHtml: function(html,session){
        return new Promise (function(resolve,reject){
            var client = new grabzit(process.env.grabzitKey, process.env.grabzitSecret);
            
            var imgName = 'res'+(Math.floor(Math.random() * 9999999) + 1)+'.png';
            var pathImg = "img/"+imgName;

            client.html_to_image('<html><style>body {font-family: arial;}table {border-collapse: collapse;} td {border: 1px solid #000;padding: 3px}</style><body>'+html+'</body></html>',optionsImg); 

            client.save_to(pathImg, function (error, id){
                console.log('id '+id+' error '+error );
                if (error != null){
                    return session.send('Ошибка при конвертировании в картинку '+error);
                }
                else {
                    /*var card = new builder.HeroCard(session)
                        .title('Рейтинг ГОСБов')
                        .subtitle('subtitle fdfdfdf')
                        .text('text text text')
                        .images([
                            builder.CardImage.create(session, process.env.pathStaticImg+imgName)
                        ])
                        //.buttons([
                        //    builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')
                        //]);
                        console.log(process.env.pathStaticImg+imgName);
                        var msg = new builder.Message(session).addAttachment(card);
                    resolve(msg);*/  
                         
                    fs.readFile(pathImg, function (err, data) {
                        if (err) {
                            return session.send('Ошибка при чтении картинки '+err);
                        }
                        var base64 = Buffer.from(data).toString('base64');
                        var contentType = 'image/png';
                        var msg = new builder.Message(session)
                            .text("")
                            .addAttachment({
                                contentUrl: util.format('data:%s;base64,%s', contentType, base64),
                                contentType: contentType
                            });
                        resolve(msg);     
                    });
                }
            }); 		
        })
    },
}