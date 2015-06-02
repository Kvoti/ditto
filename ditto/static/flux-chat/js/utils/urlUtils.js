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
    }

}
