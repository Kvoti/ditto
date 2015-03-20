var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ThreadStore = require('../stores/ThreadStore');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _whosTyping = {};

function _removeAuthor (recipient, author) {
    var whosTyping = _whosTyping[recipient];
    whosTyping.splice(whosTyping.indexOf(author), 1);
}

var WhosTypingStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getForCurrentThread: function(user) {
	var threadID = ThreadStore.getCurrentID();
        return _whosTyping[threadID];
    }

});

WhosTypingStore.dispatchToken = ChatAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_START_TYPING:
        var whosTyping = _whosTyping[action.threadID];
        if (!whosTyping) {
            whosTyping = [];
	    _whosTyping[action.threadID] = whosTyping;
        }
        whosTyping.push(action.user);
        WhosTypingStore.emitChange();
        break;

    case ActionTypes.RECEIVE_STOP_TYPING:
        _removeAuthor(action.threadID, action.user);
        WhosTypingStore.emitChange();
        break;

    default:
        // do nothing
    }

});

module.exports = WhosTypingStore;
