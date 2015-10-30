import {get, put, patch} from '../../../../js/request';
import Dispatcher from '../dispatcher/Dispatcher';
import ChatAppDispatcher from '../../../../flux-chat/js/dispatcher/ChatAppDispatcher';

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
  Dispatcher.dispatch({
    type: 'UPDATE_USER_PROFILE',
    userProfile: userProfile
  });
  // TODO we should only have/need the one dispatcher
  ChatAppDispatcher.dispatch({
    type: 'UPDATE_USER_PROFILE',
    userProfile: userProfile,
    user: user
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

export function updateUserAvatar(user, avatar) {
  patch(
  // TODO fix hardcoded url
    `/di/api/users/${user}/`,
    {avatar}
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
  // TODO sort out the duplicated dispatchers and stores
  Dispatcher.dispatch({
    type: 'UPDATE_USER_AVATAR',
    user: user,
    avatar: avatar
  });
  ChatAppDispatcher.dispatch({
    type: 'CHANGE_AVATAR',
    user: user,
    avatarName: avatar
  });
}
