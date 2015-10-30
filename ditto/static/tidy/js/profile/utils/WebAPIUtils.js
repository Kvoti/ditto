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

export function updateUserRole(user, userProfile) {
  put(
  // TODO fix hardcoded url
    `/di/api/users/${user}/`,
    userProfile
  )
    .done(() => {
      Dispatcher.dispatch({
        type: 'UPDATE_USER_PROFILE_SUCCESS'
      });
    })
    .fail(() => {
      Dispatcher.dispatch({
        type: 'UPDATE_USER_PROFILE_FAIL'
      });
    });
  // TODO .done
  // TODO .fail
  // TODO this doesn't work for admin user changing another's role
  ChatWebAPIUtils.changeRole(user, userProfile.role);
  // TODO .done
  // TODO .fail
  Dispatcher.dispatch({
    type: 'UPDATE_USER_PROFILE',
    userProfile: userProfile
  });
}

export function updateUserBio(user, userProfile) {
  put(
  // TODO fix hardcoded url
    `/di/api/users/${user}/`,
    userProfile
  )
    .done(() => {
      Dispatcher.dispatch({
        type: 'UPDATE_USER_PROFILE_SUCCESS'
      });
    })
    .fail(() => {
      Dispatcher.dispatch({
        type: 'UPDATE_USER_PROFILE_FAIL'
      });
    });
  Dispatcher.dispatch({
    type: 'UPDATE_USER_PROFILE',
    userProfile: userProfile
  });
}
