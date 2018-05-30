var builder = require('botbuilder');
var db = require('./db');
var fs = require('fs');
var util = require('util');
var grabzit = require('grabzit');
var pdfcrowd = require("pdfcrowd");

var optionsImg = {
    "browserWidth":1024, 
    "browserHeight":-1,
    /*"width":-1, 
    "height":-1,*/
    "format":"png"
};

var style = "<style>"+
    "body {font-family: arial;}"+
    "table {width: 100%;border-collapse:separator; border:solid black 1px; border-radius:15px;-moz-border-radius:15px;}"+
    "td, th {border-left:solid black 1px; border-top:solid black 1px; border-bottom:none; border-right:none; padding: 10px 3px; text-align: center;}"+
    "th {background-color: #4682B4; color: #fff; font-weight: normal;}"+
    "th:first-child {border-top: none;}"+
    "td:first-child, th:first-child {border-left: none;}"+
    ".align-left {text-align: left;}"+
    ".green {color: green;}"+
    ".red {color: red;}"+
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
    imgToHtmlPdf: function(html,session,text){
        return new Promise (function(resolve,reject){
            var client = new pdfcrowd.HtmlToImageClient(process.env.pdfcrowdLogin, process.env.pdfcrowdKey);
            
            var imgName = 'res'+(Math.floor(Math.random() * 9999999) + 1)+'.png';
            var pathImg = "img/"+imgName;

            // configure the conversion
            try {
                client.setOutputFormat("png");
            } catch(why) {
                console.error("Pdfcrowd Error: " + why);
                console.error("Pdfcrowd Error Code: " + why.getCode());
                console.error("Pdfcrowd Error Message: " + why.getMessage());
                process.exit(1);
            }

            // run the conversion and write the result to a file
            client.convertStringToFile(
                '<html>'+style+'<body>'+html+'</body></html>',
                pathImg,
                function(err, fileName) {
                    if (err) return session.send('Ошибка при конвертировании в картинку '+error);

                    console.log("Success: the file was created " + fileName);
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
                "and [ГОСБ3]!=N'НЕ ОПРЕДЕЛЕНО' "+
                "group by [ГОСБ3],[Date_create] "+
                "order by [Date_create] desc, sr desc";
        var result = await db.executeQueryData(query);
        return result;
        //JSON.stringify(result)
    },    
    user_info: async function(address) {
        var query="select * from users where channel='"+address.channelId+"' and user_id=N'"+address.user.id+"'";
        console.log(query);
        var result = await db.executeQueryData(query);
        return result;
    },
    update_user: async function (address) {
        var result = await this.user_info(address);
        var query = '';
        if (result.length) {
            var query = "update users set dat=GETDATE() where id='"+result[0].id+"'";
        }
        else {
            var query = "insert into users (channel, user_id,addr, dat) VALUES ('"+address.channelId+"', N'"+address.user.id+"','"+JSON.stringify(address)+"',GETDATE())";
        }
        console.log(query);
        db.executeQueryData(query);
    },
    data_to_html: function(data){
        var header_dat=[];
        var gosb=[];
        for (i in data) {
            if (!header_dat.includes(data[i].dat)) header_dat.push(data[i].dat); 
            if (!gosb.includes(data[i].gosb)) gosb.push(data[i].gosb);
        }
        header_dat=header_dat.reverse();
        var kol_dat = header_dat.length;
        console.log(header_dat);
        console.log(gosb);
        var html = '<table><thead><tr><th rowspan="2">Место</th><th rowspan="2">ГОСБ</th>';

        for (var i in header_dat) {
            html+='<th colspan="2">'+header_dat[i]+'</th>'
        }

        if(kol_dat>1){
            html+='<th rowspan="2">Динамика</th>';
        }
        html+='</tr><tr>';
        for (var i in header_dat) {
            html+='<th>Кол-во оценок</th><th>CSI</th>';
        }
        html+='</tr>';
        for (var i in gosb) {
            html+='<tr><td>'+(parseInt(i)+1)+'</td><td class="align-left">'+gosb[i]+'</td>';
            for (j in header_dat) {
                //html+='<td></td><td></td>';
                html+='<td>'+this.find_value(data,gosb[i],header_dat[j],'kolvo')+'</td>';
                html+='<td>'+this.find_value(data,gosb[i],header_dat[j],'sr')+'</td>';
            }
            if(kol_dat>1){
                html+='<td>'+this.dynamic(data,gosb[i],header_dat[kol_dat-1],header_dat[kol_dat-2])+'</td>';
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
    },
    dynamic: function(data,gosb,dat_new,dat_old){
        var sr_new = 0;
        var sr_old = 0;
        var dynamic = 0;
        var clas="green";
        for (var i in data) {
            if ((data[i].gosb==gosb)&&(data[i].dat==dat_new)) {
                sr_new=data[i].sr;
            }
            if ((data[i].gosb==gosb)&&(data[i].dat==dat_old)) {
                sr_old=data[i].sr;
            }
        }
        dynamic = sr_new - sr_old;
        dynamic = dynamic.toFixed(3);
        if(dynamic<0) clas="red";
        return '<span class="'+clas+'">'+dynamic+'</span>';
    }
}