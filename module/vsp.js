var builder = require('botbuilder');
var db = require('./db');
var func = require('./func');

module.exports = [
    async function (session) {

        session.sendTyping();

        var data = await func.vsp_gosb_rating();
        //session.send(JSON.stringify(data));
        var html = func.data_to_html(data);
        //console.log(html);
        var msg = await func.imgToHtml(html,session,'Рейтинг ГОСБ');
        session.send(msg);

        session.sendTyping();

        data = await func.vsp_gosb_dynamic();
        //session.send(JSON.stringify(data));
        html = func.data_to_html(data);
        //console.log(html);
        msg = await func.imgToHtml(html,session,'Динамика ГОСБ');
        session.send(msg);

        //session.endDialog();
        session.replaceDialog('main', { reprompt: true });
    },
]