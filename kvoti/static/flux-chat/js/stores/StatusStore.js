var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _status = {};

var StatusStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    get: function(user) {
        return _status;
    },

});

StatusStore.dispatchToken = ChatAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_CHAT_STATUS:
        _status[action.status.user] = action.status;
        StatusStore.emitChange();
        break;

    default:
        // do nothing
    }

});

module.exports = StatusStore;
