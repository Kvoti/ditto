function _fullUrl(part) {
    return '/' + DITTO.tenant + '/' + part;
}

module.exports = {
    startSession: function () {
	return _fullUrl('ratings/');
    }
}
