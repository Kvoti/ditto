/* Creates an object for making API calls to an API described by a config object.
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
* you create an interface to the API as follows,
*
*     const API = API.APIFactory(APIConf);
* 
* You then interact with the API like:
* 
*     API.chatrooms.list().done(rooms => console.log('got rooms', rooms));
*     API.chatrooms.retrieve(roomID);
*     API.chatrooms.create(roomConfig);
* 
* Each request method returns a object so you can attach handlers for
* success/failure etc.
*
* (Currently using jQuery for ajax but will probably switch to superagent)
*
*/
import { get, post } from '../../../js/request';
import * as actions from './APIActions';

function _fullUrl (part, id) {
    let url =  `/${DITTO.tenant}/api/${part}`;
    if (id) {
        url = `${url}/${id}/`;
    }
    return url;
}

const _API = {
    
    [actions.list]: (url) => {
        return get(_fullUrl(url));
    },
    [actions.retrieve]: (url, id) => {
        return get(_fullUrl(url, id));
    },
    [actions.create]: (url, conf) => {
        return post(_fullUrl(url), conf);
    },
    [actions.update]: (url, id, conf) => {
        return put(_fullUrl(url, id), conf);
    },
};

export default function APIFactory (APIConf) {
    // TODO sure there's a much cleaner/clearer way to construct this!
    const _endpoint = function (endpoint) {
        const conf = APIConf[endpoint];
        const _actions = {};
        for (let action in actions) {
            if (conf.actions.indexOf(action) !== -1) {
                _actions[action] = _API[action].bind(null, conf.url);
            } else {
                _actions[action] = () => {
                    throw new Error(`Action '${action}' not available for endpoint '${endpoint}'`);
                };
            }
        }
        return _actions;
    }
    const API = {};
    for (let endpoint in APIConf) {
        API[endpoint] = _endpoint(endpoint);
    }
    return API;
}
