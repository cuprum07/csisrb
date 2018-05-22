var builder = require('botbuilder');
var db = require('./db')

module.exports = [
    function (session) {

        session.send('Диалог CSI');
        session.endDialog();
    },
]