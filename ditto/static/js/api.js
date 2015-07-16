/* Experiment in factoring out the boilerplate associated with handling api calls
* 
* For each endpoint it's very labrious to manually write the
* associated actions, constants and action creators (and store
* functions that handle the actions ... but that's another project to
* create an APIStore base class or something ...
* 
* Idea is to define the api via config like:
* 
*     APIConf = {
*         chatrooms: {
*            url: 'chatrooms',
*            actions: [list, detail, create]
*         }
*     }   
* 
* which you pass to a factory function.
* 
*     const api = API.APIFactory(APIConf);
* 
* You then interact with the API like:
* 
* let rooms = api.chatrooms.list();
* let room = api.chatrooms.get(roomID);
* let room = api.chatrooms.create(roomConfig);
* 
* (thinking about it someone probably already has a nice api abstraction library like this?)
* (TODO being super cool we could infer this from the rest_framework config)
*
*
Using the APIConf we can also factor out action/constant boilerplate in the same way


let actions = actionFactory(apiConf);
actions.chatrooms.list();
actions.chatrooms.create();

where create will emit createChatroom action and then createChatroom(Success|Failure)
depending on the result of the API request.

*/
import { get, post } from './request';

export const list = 'list', detail = 'detail', create = 'create', update = 'update';

function _fullUrl (part, id) {
    let url =  `/${DITTO.tenant}/api/${part}`;
    if (id) {
        url = `${url}/${id}`;
    }
    return url;
}

const actions = {
    
    [list]: (url) => {
        return get(_fullUrl(url));
    },
    [detail]: (url, id) => {
        return get(_fullUrl(url, id));
    },
    [create]: (url, conf) => {
        return post(_fullUrl(url), conf);
    },
    [update]: (url, id, conf) => {
        return put(_fullUrl(url, id), conf);
    },
};

export default function apiFactory (apiConf) {
    // TODO sure there's a much cleaner/clearer way to construct this!
    const _endpoint = function (endpoint) {
        const conf = apiConf[endpoint];
        const _actions = {};
        for (let action in actions) {
            if (conf.actions.indexOf(action) !== -1) {
                _actions[action] = actions[action].bind(null, conf.url);
            } else {
                _actions[action] = () => {
                    throw new Error(`Action '${action}' not available for endpoint '${endpoint}'`);
                };
            }
        }
        return _actions;
    }
    const api = {};
    for (let endpoint in apiConf) {
        api[endpoint] = _endpoint(endpoint);
    }
    return api;
}
