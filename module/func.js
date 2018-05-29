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

var style = "<style>"+
    "body {font-family: arial;}"+
    "table {border-collapse: collapse; width: 100%;}"+
    "td {border: 1px solid #000; padding: 3px; text-align: center;}"+
    ".align-left {text-align: left;}"+
    "thead td {wont-weight: bold;}"+
"</style>"

module.exports = {
    imgToHtml: function(html,session,text){
        return new Promise (function(resolve,reject){
            var client = new grabzit(process.env.grabzitKey, process.env.grabzitSecret);
            
            var imgName = 'res'+(Math.floor(Math.random() * 9999999) + 1)+'.png';
            var pathImg = "img/"+imgName;

            client.html_to_image('<html>'+style+'<body>'+html+'</body></html>',optionsImg); 

            client.save_to(pathImg, function (error, id){
                console.log('id '+id+' error '+error );
                if (error != null){
                    return session.send('Ошибка при конвертировании в картинку '+error);
                }
                else {
                    if (session.message.source=='msteams') {
                        fs.readFile(pathImg, function (err, data) {
                            if (err) {
                                return session.send('Ошибка при чтении картинки '+err);
                            }
                            var base64 = Buffer.from(data).toString('base64');
                            var contentType = 'image/png';
                            var msg = new builder.Message(session)
                                .text(text)
                                .addAttachment({
                                    contentUrl: util.format('data:%s;base64,%s', contentType, base64),
                                    contentType: contentType
                                });
                            resolve(msg);     
                        });
                    }
                    else {
                        var card = new builder.HeroCard(session)
                            .title(text)
                            /*.subtitle('subtitle fdfdfdf')
                            .text('text text text')*/
                            .images([
                                builder.CardImage.create(session, process.env.pathStaticImg+imgName)
                            ])
                        //.buttons([
                        //    builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')
                        //]);
                        var msg = new builder.Message(session).addAttachment(card);
                        resolve(msg);
                    }                         
                }
            }); 		
        })
    },
    vsp_gosb_rating: async function(){
        var query = "SELECT "+ 
                "[ГОСБ3] as gosb, "+
                "Format([Date_create], 'dd.MM.yyyy') as dat, "+
                "count([Оценка1]) as kolvo, "+
                "ROUND(AVG ([Оценка1]),3) as sr "+
            "FROM [dbo].[VSP] "+
                "where [Date_create]=(select max([Date_create]) from [dbo].[VSP]) "+
                "group by [ГОСБ3],[Date_create] "+
                "order by [Date_create] desc, sr desc";
        var result = await db.executeQueryData(query);
        return result;
        //JSON.stringify(result)
    },
    vsp_gosb_dynamic: async function(){
        var query = "SELECT "+ 
                "[ГОСБ3] as gosb, "+
                "Format([Date_create], 'dd.MM.yyyy') as dat, "+
                "count([Оценка1]) as kolvo, "+
                "ROUND(AVG ([Оценка1]),3) as sr "+
            "FROM [dbo].[VSP] "+
                "where [Date_create] in (select top 3 [Date_create] from [dbo].[VSP] group by [Date_create] order by [Date_create] desc) "+
                "group by [ГОСБ3],[Date_create] "+
                "order by [Date_create] desc, sr desc";
        var result = await db.executeQueryData(query);
        return result;
        //JSON.stringify(result)
    },    
    data_to_html: function(data){
        var header_dat=[];
        var gosb=[];
        for (i in data) {
            if (!header_dat.includes(data[i].dat)) header_dat.push(data[i].dat); 
            if (!gosb.includes(data[i].gosb)) gosb.push(data[i].gosb);
        }
        header_dat=header_dat.reverse();

        console.log(header_dat);
        console.log(gosb);
        var html = '<table><thead><tr><td rowspan="2">Место</td><td rowspan="2">ГОСБ</td>';

        for (var i in header_dat) {
            html+='<td colspan="2">'+header_dat[i]+'</td>'
        }
        html+='</tr><tr>';
        for (var i in header_dat) {
            html+='<td>Количество</td><td>CSI</td>';
        }
        html+='</tr>';
        for (var i in gosb) {
            html+='<tr><td>'+(parseInt(i)+1)+'</td><td class="align-left">'+gosb[i]+'</td>';
            for (j in header_dat) {
                //html+='<td></td><td></td>';
                html+='<td>'+this.find_value(data,gosb[i],header_dat[j],'kolvo')+'</td>';
                html+='<td>'+this.find_value(data,gosb[i],header_dat[j],'sr')+'</td>';
            }
            html+='</tr>';
        }
        html+='</table>';
        return html;
    },
    find_value: function(data,gosb,dat,tip){
        var value='';
        for (var i in data) {
            if ((data[i].gosb==gosb)&&(data[i].dat==dat)) {
                console.log(data[i].kolvo+' '+data[i].sr+' '+gosb+' '+dat);
                if (tip=='kolvo') value = data[i].kolvo;
                if (tip=='sr') value = data[i].sr;
            }
        }
        return value;
    }
}