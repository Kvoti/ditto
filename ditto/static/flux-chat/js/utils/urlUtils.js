function _fullUrl(part) {
    return '/' + DITTO.tenant + '/' + part;
}

// TODO be nice to be DRY and compute this from django's url config
module.exports = {
    startSession: function () {
	return _fullUrl('ratings/');
    },

    getSessionRating: function (threadID) {
	return _fullUrl('ratings/' + threadID + '/');
    },

    rateSession (threadID) {
	return this.getSessionRating(threadID);
    },

    messages () {
        return _fullUrl('messages/');
    },

    message (threadID) {
        return _fullUrl('messages/' + threadID + '/');
    },

    sessions () {
        return _fullUrl('sessions/');
    },

    session (threadID) {
        return _fullUrl('sessions/' + threadID + '/');
    },

    chatroom (roomID) {
        return _fullUrl('chatroom/' + roomID + '/');
    },

    chatroomConfig (roomID) {
        return _fullUrl('config/chatroom/' + roomID + '/');
    },

    api: {
        roles () {
            return _fullUrl('api/roles/');
        },

        chatrooms () {
            return _fullUrl('api/chat/rooms/');
        },
        
        chatroom (roomID) {
            return this.chatrooms() + roomID + '/';
        },

        slots () {
            return _fullUrl('api/chat/slots/');
        },
        
        slot (slotID) {
            return this.slots() + slotID + '/';
        }
    }

}
