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
        }).done((res) => {
            // TODO wonder if this is a bit flaky, as we're relying on holding
            // on to a reference to the new slot so the store can update it with
            // its ID once saved
            SettingsActionCreators.receiveCreateSlotSuccess(slot, res['id']);
        });
        // TODO success callback to remove pending state from slot and also set id
        // for saved slot
        // TODO error callback to so slot can be removed from store/ui (retry option?)
    },
    
    updateSlot (slot) {
        $.ajax({
            // TODO fix hardcoded url
            url: '/di/api/chat/slots/' + slot.id + '/',
            type: "PUT",
            data: JSON.stringify(slot),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: () => console.log('rate session failed')
        })        
        // TODO success callback to remove pending state from slot
        // for saved slot
        // TODO error callback to so slot can be restored on failure (retry option?)
    },

    deleteSlot (slotID) {
        $.ajax({
            // TODO fix hardcoded url
            url: '/di/api/chat/slots/' + slotID + '/',
            type: "DELETE",
            dataType: "json",
        });
        // TODO handle success/failure
    },
};
