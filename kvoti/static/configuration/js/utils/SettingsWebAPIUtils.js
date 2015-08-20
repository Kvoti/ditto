var utils = require('../utils');
var assign = require('object-assign');
var urls = require('../../../flux-chat/js/utils/urlUtils.js');

import { get, post, put, del } from '../../../js/request';

module.exports = {

    // TODO worth factoring this out further?
    //
    // load (things) {
    //     get(urls.api[things])
    //         .done(response => SettingsActionCreators.receive[things](response))
    // },
    //
    loadRoles () {
        get(urls.api.roles())
            .done(res => {
                SettingsActionCreators.receiveRoles(res);
            })
            // TODO .fail
    },

    loadChatrooms () {
        get(urls.api.chatrooms())
            .done(res => {
                // Only deal with datetimes as strings at api boundary
                res.forEach(room => {
                    room.start = utils.ISODateStringToDate(room.start);
                    room.end = utils.ISODateStringToDate(room.end);
                });
                SettingsActionCreators.receiveChatrooms(res);
            });
            // TODO .fail
    },

    createRoom (roomConfig) {
        post(urls.api.chatrooms(), roomConfig)
        // TODO .done
        // TODO .fail
    },
    
    updateRoom (slug, roomConfig) {
        roomConfig = {...roomConfig};
        roomConfig.start = roomConfig.start && roomConfig.start.toISOString() || null;
        roomConfig.end = roomConfig.end && roomConfig.end.toISOString() || null;
        // TODO think we have a fail handler somewhere else but for consistency
        // should probably raise an action here
        return put(urls.api.chatroom(slug), roomConfig);
        // TODO .done
        // TODO .fail
    },
    
    deleteRoom (slug) {
        return del(urls.api.chatroom(slug))
    },
    
    loadSlots () {
        get(urls.api.slots())
            .done(res => {
                SettingsActionCreators.receiveSlots(res);
            });
            // TODO .fail
    },

    createSlot (slot) {
        post(urls.api.slots(), slot)
            .done((res) => {
                // TODO wonder if this is a bit flaky, as we're relying on holding
                // on to a reference to the new slot so the store can update it with
                // its ID once saved
                SettingsActionCreators.receiveCreateSlotSuccess(slot, res['id']);
            });
            // TODO .fail, so slot can be removed from store/ui (retry option?)
    },
    
    updateSlot (slot) {
        // TODO shouldn't this be put /slots/:slotID/ ?
        put(urls.api.slots(), slot);
        // TODO success callback to remove pending state from slot
        // for saved slot
        // TODO error callback to so slot can be restored on failure (retry option?)
    },

    deleteSlot (slotID) {
        del(urls.api.slot(slotID));
        // TODO handle success/failure
    },

};

var SettingsActionCreators = require('../actions/SettingsActionCreators');
