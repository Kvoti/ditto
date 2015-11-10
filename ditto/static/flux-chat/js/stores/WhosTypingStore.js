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
  if (whosTyping) {
    whosTyping.splice(whosTyping.indexOf(author), 1);
  }
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
      if (threadID) {
        let key = getThreadKey(threadID);
        return _whosTyping[key];
      }
      return [];
    }

});

WhosTypingStore.dispatchToken = ChatAppDispatcher.register(function(action) {
  let key;
    switch(action.type) {

        // TODO need to make this work with threading

    case ActionTypes.RECEIVE_START_TYPING:
      key = getThreadKey(action.threadID);
        var whosTyping = _whosTyping[key];
        if (!whosTyping) {
            whosTyping = [];
            _whosTyping[key] = whosTyping;
        }
      whosTyping.push(action.user);
      console.log('typing', _whosTyping);
        WhosTypingStore.emitChange();
        break;

    case ActionTypes.RECEIVE_STOP_TYPING:
      key = getThreadKey(action.threadID);
        _removeAuthor(key, action.user);
      console.log('typing', _whosTyping);
        WhosTypingStore.emitChange();
        break;

    default:
        // do nothing
    }

});


function getThreadKey(threadID) {
  // chatstates doesn't know about threads so we don't know when someone
  // is typing in a particular thread. (prob easy to modify chatstates js to pass
  // <thread> in the message?)
  return threadID.split(':').slice(0, 2).join(':');
}

module.exports = WhosTypingStore;
