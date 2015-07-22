/* Creates action creators and action constants for standard API actions.
*
* E.g. with the following API config,
* 
*     const APIConf = {
*             chatrooms: {
*                url: 'chatrooms',
*                actions: [list, retrieve, create]
*             }
*     }   
* 
* You create action creators and constants as follows,
*
*     let actions = APIActionFactory(APIConf);
*
* You call actions like:
*
*     actions.chatrooms.create(roomConfig);
*
* This dispatches actions.chatrooms.CREATE (e.g. for optimistic updates) then
*
*     actions.chatrooms.CREATE_SUCCESS
*     actions.chatrooms.CREATE_FAILURE
*
* depending on the result of the request.
*
*/
import APIFactory from './APIFactory';

let pendingID = 0;

export default function actionFactory (APIConf) {
    const API = APIFactory(APIConf);
    let endpoints = {};
    for (let endpoint in APIConf) {
        endpoints[endpoint] = makeEndpoint(API, APIConf, endpoint);
    }
    return endpoints;
}

function makeEndpoint(API, APIConf, endpoint) {
    let obj = {};
    APIConf[endpoint].actions.forEach(action => {
        let actionFunc = makeAction(API[endpoint], action);
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

function makeAction(API, action) {
    let key = action.toUpperCase();
    return function (payload) {
        return (dispatch) => {
            let pendingID = _pendingID();
            let call = API[action](payload)
                .done(res => {
                    dispatch(_action(this[`${key}_SUCCESS`], res, pendingID));
                })
                .fail((jqXHR, textStatus, error) => {
                    console.log(jqXHR, textStatus, error);
                    dispatch(_action(this[`${key}_FAILURE`], textStatus, pendingID));
                })
            return dispatch(_action(this[key], payload, pendingID));
        }
    };
}

function _action (action, payload, pendingID) {
    console.log('dispatched', action, payload, pendingID);
    return {
        type: action,
        payload: payload,
        pendingID: pendingID,
    };
}

function _pendingID () {
    pendingID += 1;
    console.log('pendingID', pendingID);
    return pendingID;
}
