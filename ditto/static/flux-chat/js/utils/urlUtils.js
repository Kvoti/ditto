function _fullUrl(part) {
    return '/' + DITTO.tenant + '/' + part;
}

// TODO be nice to be DRY and compute this from django's url config
// TODO but if not doing that at least factor this down as most urls follow the same
// pattern (and ones that don't probably should)
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

    chatrooms () {
        return _fullUrl('chatroom/');
    },
    
    chatroom (roomID) {
        return this.chatrooms() + roomID + '/';
    },

    chatroomConfig (roomID) {
        return _fullUrl('config/chatroom/' + roomID + '/');
    },

    tickets () {
        return _fullUrl('dashboard/tickets/');
    },
    
    ticket (ticketID) {
        return this.tickets() + ticketID + '/';
    },
    
    users () {
        return _fullUrl('people/');
    },
    
    user (userID) {
        return this.users() + userID + '/';
    },
    
    api: {
        roles () {
            return _fullUrl('api/roles/');
        },

        forms (roleName) {
            return _fullUrl('forms/api/' + roleName + '/');
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
        },
        
        tickets () {
            return _fullUrl('api/tickets/');
        },
        
        ticket (ticketID) {
            return this.tickets() + ticketID + '/';
        },
        
        users () {
            return _fullUrl('api/users/');
        },
        
        user (userID) {
            return this.users() + userID + '/';
        }
        
    }

}
