/* Attempt to remove boilerplate for server actions

e.g. creating a chatroom involves the following

POST /chat/rooms/
{ conf }

constants.CREATE_CHATROOM
constants.CREATE_CHATROOM_SUCCESS
constants.CREATE_CHATROOM_FAILURE

ServerActions.createChatroom = function (conf) {
    api.chatrooms.create(conf)
       .done(res => this.createChatroomSuccess(conf))
       .fail(res => this.createChatroomFailure(conf));
    this.createChatroom(conf);
}

It's very tedious to type all that out long hand. Instead we can infer it
from an api conf:

    {
         chatrooms: {
            url: 'chat/rooms/',
            actions: [list, create]
         }
     }   

Like the API factory we can have an actionFactory:

actions = actionFactory(APIConf);

actions.chatrooms.create(conf);

then stores can listen for

actions.chatrooms.CREATE
actions.chatrooms.CREATE_SUCCESS
actions.chatrooms.CREATE_FAILURE
actions.chatrooms.CREATE_REVERT?

*/
import apiFactory from './api';

export default function actionFactory (APIConf) {
    const api = apiFactory(APIConf);
    let endpoints = {};
    for (let endpoint in APIConf) {
        endpoints[endpoint] = makeEndpoint(api, APIConf, endpoint);
    }
    return endpoints;
}

function makeEndpoint(api, APIConf, endpoint) {
    let obj = {};
    APIConf[endpoint].actions.forEach(action => {
        let actionFunc = makeAction(api[endpoint], action);
        let constants = makeConstants(endpoint, action);
        obj[action] = actionFunc;
        obj = { ...obj, ...constants };
    });
    return obj;
}

function makeConstants(endpoint, action) {
    let key = action.toUpperCase();
    return {
        [key]: `${key}_${endpoint}`,
        [`${key}_SUCCESS`]: `${key}_${endpoint}_success`,
        [`${key}_FAILURE`]: `${key}_${endpoint}_failure`,
    };
}

function makeAction(api, action) {
    let key = action.toUpperCase();
    return function (...args) {
        api[action](...args)
            .done(res => {
                dispatch(this[`${key}_SUCCESS`]);
            })
            .fail(res => {
                dispatch(this[`${key}_FAILURE`]);
            })
        dispatch(this[key]);
    };
}

function dispatch (action) {
    console.log('dispatched', action);
}
