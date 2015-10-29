// Note, wanted to use redux but latest redux needs react 0.14 -- would probably lead to
// upgrade hell...
import { EventEmitter } from 'events';
import assign from 'object-assign';
import Dispatcher from '../dispatcher/Dispatcher';

const CHANGE_EVENT = 'change';

let _userProfile = null;

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
    return _userProfile
  },

});

UserProfileStore.dispatchToken = Dispatcher.register(function(action) {

  switch(action.type) {

  case 'RECEIVE_USER_PROFILE':
    _userProfile = action.userProfile;
    UserProfileStore.emitChange();
    break;
    
  case 'UPDATE_USER_PROFILE':
    _userProfile = action.userProfile;
    UserProfileStore.emitChange();
    break;

    // // mongooseim doesn't support pubsub so avatar changes are not
    // // broadcast yet so we have to listen for this action so at least
    // // the user sees their own avatar change immediately
    // case ActionTypes.CHANGE_AVATAR:
    //     _userProfiles[action.user].avatar = action.avatarName;
    //     UserProfileStore.emitChange();
    //     break;
    
  default:
    // do nothing
  }

});

export default UserProfileStore;
