// Factory function to create Redux store (reducer?) for given REST API endpoint.
import APIActionFactory from './APIActionFactory';
import itemStatus from './itemStatus';

export default function APIStoreFactory (APIConf, endpoint) {
    let actions = APIActionFactory(APIConf)[endpoint];
    
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
            item = _getItem(state, 'pendingID', actions.pendingID);
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
