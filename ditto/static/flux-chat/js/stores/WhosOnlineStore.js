var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ThreadStore = require('../stores/ThreadStore');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _whosOnline = {};

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
        return _whosOnline[ThreadStore.getCurrentRoomJID()] || [];
    }
});

WhosOnlineStore.dispatchToken = ChatAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_ONLINE:
        var inside = _whosOnline[action.room];
        if (!inside) {
            _whosOnline[action.room] = [];
        }
      // TODO hack here to prevent adding same user multiple times
      // really should fix presence handling so action is not raised
      // is user is *already* in a chatroom.
      if (_whosOnline[action.room].indexOf(action.user) === -1) {
        _whosOnline[action.room].push(action.user);
        WhosOnlineStore.emitChange();
      }
        break;

    case ActionTypes.RECEIVE_OFFLINE:
        _removeUser(action.user, action.room);
        WhosOnlineStore.emitChange();
        break;

    default:
        // do nothing
    }

});

function _removeUser (user, room) {
    _whosOnline[room].splice(_whosOnline[room].indexOf(user), 1);
}

module.exports = WhosOnlineStore;
