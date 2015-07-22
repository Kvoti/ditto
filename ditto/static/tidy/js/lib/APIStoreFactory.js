// Factory function to create Redux reducers for state from API.
//
// E.g. with the following API config,
// 
//     const APIConf = {
//             chatrooms: {
//                url: 'chatrooms',
//                actions: [list, retrieve, create]
//             }
//     }   
//
// You create reducers with,
//
//     let reducers = APIStoreFactory(APIConf);
//
// which returns an object of the form,
//
// {
//     <endpoint>: reducer,
//     <endpoint1>: reducer1,
//     ...
// }
//
// Where the reducer handles the typical actions relevant to an API endpoint
// such as CREATE, CREATE_SUCCESS, CREATE_FAILURE
//
// This object can be used directly to initialise redux,
//
//      const redux = createRedux(reducers)
//
import APIActionFactory from './APIActionFactory';
import itemStatus from './itemStatus';

export default function APIStoreFactory (APIConf) {
    let actions = APIActionFactory(APIConf);
    let reducers = {};
    for (let endpoint in APIConf) {
        reducers[endpoint] = _createReducer(actions[endpoint]);
    }
    return reducers;
}
    
function _createReducer (actions) {
    return function (state = [], action) {
        console.log('got action', action);
        let item;
        if (action.type === actions.CREATE) {
            item = {...action.payload, status: itemStatus.pending, pendingID: action.pendingID};
            return [...state, item];
            
        } else if (action.type === actions.CREATE_SUCCESS) {
            let item = {...action.payload, status: itemStatus.saved};
            return _replaceItem(state, 'pendingID', action.pendingID, item);

        } else if (action.type === actions.CREATE_FAILURE) {
            item = _getItem(state, 'pendingID', action.pendingID);
            item.status = itemStatus.failed;
            return _replaceItem(state, 'pendingID', action.pendingID, item);

        } else if (action.type === actions.LIST_SUCCESS) {
            console.log('adding items', action.payload);
            return [...action.payload];
        }

        // TODO handle rest of actions!
    }
}

function _getItem (state, key, value) {
    return state.find(item => item[key] === value);
}

function _replaceItem (state, key, value, item) {
    let index = state.findIndex(item => item[key] === value);
    let newState = [...state];
    newState.splice(index, 1, item);
    return newState;
}
