require('dotenv').config();
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var db = require('./module/db')

// Setup Restify Server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
   console.log('server', process.env.msSqlServer); 
});

server.get('/img/*', restify.plugins.serveStatic({
    directory: __dirname,
    default: 'index.html'
  }));

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
	appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
/*var bot = new builder.UniversalBot(connector, async function (session) {
    console.log('fff dkfhkhgksghw')
    var query = "select * from test"
    var result = await db.executeQueryData(query)
    console.log(result)
    session.send("You said ещё добавил текста бла бла ЕЕЕ: %s", session.message.text+' '+JSON.stringify(result));
	
	
});*/

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
    async function(session){
        console.log(session)
        var query = "select * from test";
        var result = await db.executeQueryData(query);

        savedAddress = { 
          id: '7GFNVv1ArAQ',
          channelId: 'telegram',
          user: [Object],
          conversation: [Object],
          bot: [Object],
          serviceUrl: 'https://telegram.botframework.com' 
        };
        sendProactiveMessage(savedAddress);
        //JSON.stringify(result)
        session.send("Приветствую вас! Я CSI бот Среднерусского банка.");
        session.beginDialog("main");
    }
]).set('storage', inMemoryStorage); // Register in memory storage

bot.dialog('main', require('./module/main'));
bot.dialog('vsp', require('./module/vsp'));
bot.dialog('premier', require('./module/premier'));
bot.dialog('sm', require('./module/sm'));
bot.dialog('dsa', require('./module/dsa'));
bot.dialog('appeal', require('./module/appeal'));


bot.dialog('vsp_vsp', [
    function (session) {
        session.send('Динамика ВСП');
        return session.endDialog();
    },
    /*function (session, results) {
        session.endDialog(`Hello ${results.response}!`);
    }*/
]);

bot.dialog('vsp_rgo', [
    function (session) {
        session.send('Рейтинг РГВСП');
        return session.endDialog();
    },
    /*function (session, results) {
        session.endDialog(`Hello ${results.response}!`);
    }*/
]);

// log any bot errors into the console

bot.on('error', function (e) {
    console.log('And error ocurred', e);
});

function sendProactiveMessage(address) {
    console.log('adress '+address)
    var msg = new builder.Message().address(address);
    msg.text('Это оповещение');
    msg.textLocale('ru-RU');
    bot.send(msg);
}