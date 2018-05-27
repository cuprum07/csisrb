var builder = require('botbuilder');
var db = require('./db')

var DialogLabels = {
    what_csi: 'Что такое CSI?',
    appeal: 'Аппеляция',
    csi: 'Узнать CSI'
};

module.exports = [
    function (session) {

        // prompt for search option

        builder.Prompts.choice(

            session,

            'Что вас интересует?',

            ['DSA',DialogLabels.what_csi, DialogLabels.appeal , DialogLabels.csi],

            {
                maxRetries: 3,
                retryPrompt: 'Not a valid option',
                listStyle: 3
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
            case 'DSA':
                return session.beginDialog('dsa');    
        }

    }
]