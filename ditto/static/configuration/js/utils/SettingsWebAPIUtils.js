var SettingsActionCreators = require('../actions/SettingsActionCreators');

module.exports = {

    loadChatrooms () {
        // TODO handle errors
        $.get(
            '/di/api/chat/rooms/',
            function (res) {
                SettingsActionCreators.receiveChatrooms(res);
            }
        );
    },

};
