var builder = require('botbuilder');


module.exports = [
    function (session) {

        session.send('CSI - индекс удовлетворенности клиента');
        session.endDialog();

    },
]