require('dotenv').config();
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var db = require('./module/db')

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
   console.log('app', process.env.MicrosoftAppId); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
	appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var DialogLabels = {

    what_csi: 'Что такое CSI?',

    appeal: 'Аппеляция',

    csi: 'Узнать CSI'

};

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

    function (session) {

        // prompt for search option

        builder.Prompts.choice(

            session,

            'Что вас интересует?',

            [DialogLabels.what_csi, DialogLabels.appeal , DialogLabels.csi],

            {

                maxRetries: 3,

                retryPrompt: 'Not a valid option'

            });

    },

    function (session, result) {

        if (!result.response) {

            // exhausted attemps and no selection, start over

            session.send('Ooops! Too many attemps :( But don\'t worry, I\'m handling that exception and you can try again!');

            return session.endDialog();

        }



        // on error, start over

        session.on('error', function (err) {

            session.send('Failed with message: %s', err.message);

            session.endDialog();

        });



        // continue on proper dialog

        var selection = result.response.entity;

        switch (selection) {

            case DialogLabels.what_csi:

                return session.beginDialog('what_csi');

            case DialogLabels.appeal:

                return session.beginDialog('appeal');

            case DialogLabels.csi:

                return session.beginDialog('csi');

        }

    }

]).set('storage', inMemoryStorage); // Register in memory storage



bot.dialog('what_csi', require('./module/what_csi'));

bot.dialog('appeal', require('./module/appeal'));

bot.dialog('csi', require('./module/csi'))

// log any bot errors into the console

bot.on('error', function (e) {

    console.log('And error ocurred', e);

});