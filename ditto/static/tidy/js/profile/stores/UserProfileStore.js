// Note, wanted to use redux but latest redux needs react 0.14 -- would probably lead to
// upgrade hell...
import { EventEmitter } from 'events';
import assign from 'object-assign';
import Dispatcher from '../dispatcher/Dispatcher';

const CHANGE_EVENT = 'change';

let _userProfile = null;
let _status = null;

const UserProfileStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  get: function() {
    return _userProfile;
  },

  getStatus: function() {
    return _status;
  }

});

UserProfileStore.dispatchToken = Dispatcher.register(function(action) {

  switch(action.type) {

  case 'RECEIVE_USER_PROFILE':
    _userProfile = action.userProfile;
    UserProfileStore.emitChange();
    break;
    
  case 'UPDATE_USER_PROFILE':
    _userProfile = action.userProfile;
    _status = 'saving';
    UserProfileStore.emitChange();
    break;

  case 'UPDATE_USER_PROFILE_SUCCESS':
    _status = 'saved';
    UserProfileStore.emitChange();
    break;
    
  case 'UPDATE_USER_PROFILE_FAIL':
    _status = 'failed';
    UserProfileStore.emitChange();
    break;

  default:
    // do nothing
  }

});

export default UserProfileStore;
