var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _status;

var ConnectionStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    get: function () {
        return _status;
    }
    
});

ConnectionStore.dispatchToken = ChatAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.CONNECT:
        _status = ChatConstants.connected;
        ConnectionStore.emitChange();
        break;
        
    case ActionTypes.DISCONNECT:
        _status = ChatConstants.disconnected;
        ConnectionStore.emitChange();
        break;

    default:
        // do nothing
    }

});

module.exports = ConnectionStore;
