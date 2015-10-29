import {get, put} from '../../../../js/request';
import Dispatcher from '../dispatcher/Dispatcher';
import ChatWebAPIUtils from '../../../../flux-chat/js/utils/ChatWebAPIUtils';

export function getUserProfile(user) {
  get(
    // TODO fix hardcoded url
    `/di/api/users/${user}/`)
    .done(res => {
      Dispatcher.dispatch({
        type: 'RECEIVE_USER_PROFILE',
        userProfile: res
      });
    });
  // TODO .fail(
}

export function setUserProfile(user, userProfile) {
  put(
  // TODO fix hardcoded url
    `/di/api/users/${user}/`,
    userProfile
  );
  ChatWebAPIUtils.changeRole(user, userProfile.role);
  // TODO .done
  // TODO .fail
  Dispatcher.dispatch({
    type: 'UPDATE_USER_PROFILE',
    userProfile: userProfile
  });
}
