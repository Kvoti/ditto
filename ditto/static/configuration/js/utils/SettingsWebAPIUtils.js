var SettingsActionCreators = require('../actions/SettingsActionCreators');

module.exports = {

    loadChatrooms () {
        // TODO handle errors
        $.get(
            // TODO fix hardcoded url
            '/di/api/chat/rooms/',
            function (res) {
                SettingsActionCreators.receiveChatrooms(res);
            }
        );
    },

    loadSlots () {
        // TODO handle errors
        $.get(
            // TODO fix hardcoded url
            '/di/api/chat/slots/',
            function (res) {
                SettingsActionCreators.receiveSlots(res);
            }
        );
    },

    createSlot (slot) {
        $.ajax({
            // TODO fix hardcoded url
            url: '/di/api/chat/slots/',
            type: "POST",
            data: JSON.stringify(slot),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: () => console.log('rate session failed')
        })        
        // TODO success callback to remove pending state from slot
        // TODO error callback to so slot can be removed from store/ui (retry option?)
    },
    
};
