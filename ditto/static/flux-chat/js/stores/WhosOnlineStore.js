var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ThreadStore = require('../stores/ThreadStore');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _whosOnline = [];

function _removeUser (user) {
    _whosOnline.splice(_whosOnline.indexOf(user), 1);
}

var WhosOnlineStore = assign({}, EventEmitter.prototype, {

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
        console.log(_whosOnline);
        return _whosOnline;
    }
});

WhosOnlineStore.dispatchToken = ChatAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_ONLINE:
        _whosOnline.push(action.user);
        WhosOnlineStore.emitChange();
        break;

    case ActionTypes.RECEIVE_OFFLINE:
        _removeUser(action.user);
        WhosOnlineStore.emitChange();
        break;

    default:
        // do nothing
    }

});

module.exports = WhosOnlineStore;
