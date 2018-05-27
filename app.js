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
        var query = "select * from test";
        var result = await db.executeQueryData(query);
        session.send("Привет, это CSI бот Среднерусского банка."+JSON.stringify(result));
        session.beginDialog("main");
    }
]).set('storage', inMemoryStorage); // Register in memory storage

bot.dialog('main', require('./module/main'));
bot.dialog('what_csi', require('./module/what_csi'));
bot.dialog('appeal', require('./module/appeal'));
bot.dialog('csi', require('./module/csi'));
bot.dialog('dsa', require('./module/dsa'));

// log any bot errors into the console

bot.on('error', function (e) {
    console.log('And error ocurred', e);
});