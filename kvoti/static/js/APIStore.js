/* Experiment with removing boilerplate from stores that handle data from apis

As with the api calls and the actions these stores all follow a very similar pattern

The action handlers do some or all of:

addThing
addThings
addPendingThing
markPendingThingSaved
markPendingThingFailed
revertPendingThing

Typical accessors are:

getAll
getThing

From an API conf like

    {
         chatrooms: {
            url: 'chat/rooms/',
            actions: [list, create]
         }
     }   

We can *generate* a store. It can be used as is or optionally extended
if used as a base class.

It does assume a 1-1 mapping between api endpoints and stores. Not sure if that's
sensible or not...

*/

let EventEmitter = require('events').EventEmitter;
import actionFactory from './serverActions';

const CHANGE_EVENT = 'change';

const itemStatus = {
    pending: 'pending',
    saved: 'saved',
    failed: 'failed',
};

// For now this is vanilla a vanilla flux store from the facebook examples.
// Will probably switch to redux as it seems simple and powerful but can
// still generate redux stores from the API conf.
export default class APIStore extends EventEmitter {
    constructor (APIConf, endpoint, dispatcher) {
        super();
        this._items = [];
        this._registerActions(APIConf, endpoint, dispatcher);
    }

    emitChange () {
        console.log('changed', this._items);
        this.emit(CHANGE_EVENT);
    }

    addChangeListener (callback) {
        this.on(CHANGE_EVENT, callback);
    }

    removeChangeListener (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
    
    getAll () {
        return this._items;
    }

    getItem (key, value) {
        return this._items.find(item => item[key] === value);
    }

    _registerActions (APIConf, endpoint, dispatcher) {
        let actions = actionFactory(APIConf)[endpoint];
        
        dispatcher.register(action => {
            console.log('got action', action);
            let item;
            if (action.type === actions.CREATE) {
                item = {...action.item, status: itemStatus.pending};
                this._items = [...this._items, item];
                this.emitChange();

            } else if (action.type === actions.CREATE_SUCCESS) {
                item = this.getItem('id', actions.pendingID);
                item = {...item, id: action.id};
                item.status = itemStatus.saved
                this._replaceItem(item);
                this.emitChange();

            } else if (action.type === actions.CREATE_FAILURE) {
                item = this.getItem('id', actions.pendingID);
                item = {...item, id: action.id};
                item.status = itemStatus.failed;
                this._replaceItem(item);
                this.emitChange();

            } else if (action.type === actions.LIST_SUCCESS) {
                this._items = [...action.items];
                this.emitChange();
            }
        });
    }

    _replaceItem (item) {
        let index = this._items.find(item => item.id === item.id);
        let items = this._items.splice(index, 1, item);
        this._items = items;
    }
    
}
