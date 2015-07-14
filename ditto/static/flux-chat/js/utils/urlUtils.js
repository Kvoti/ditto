function _fullUrl(part) {
    return '/' + DITTO.tenant + '/' + part;
}

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

    thread (threadID) {
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
}
