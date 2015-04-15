var React = require('react/addons');
var update = React.addons.update;
var BaseSortable = require('react-components/Sortable');

/*

Wrap Khan's sortable component to handle keeping component state
in sync with re-order operations

TODO maybe don't need this, is it ok to store components *as* state??

*/

// thing wrapper around a sortable item
// so we can store the thingID as a prop
var Thing = React.createClass({
    render: function () {
	return (
	    <div draggable={true}>
		{this.props.children}
	    </div>
	);
    }
});
    
var Sortable = {
    
    getOrderedThings: function () {
	var orderedThings = [];
	var things = this.state[this.orderedStateKey];
	for (var id in things) {
	    orderedThings.push({
		id: id,
		order: things[id].order
	    });
	}
	orderedThings.sort((a, b) => a.order - b.order);
	return orderedThings.map(t => t.id);
    },

    getMaxOrder: function () {
	var maxOrder;
	var orderedItemIDs = this.getOrderedThings();
	if (orderedItemIDs.length) {
	    var lastID = orderedItemIDs.slice(-1)[0];
	    var lastItem = this.state[this.orderedStateKey][lastID];
	    maxOrder = lastItem.order;
	} else {
	    maxOrder = -1;
	}
	return maxOrder;
    },

    removeItem: function (itemID) {
	// React.addons.update has no operation to remove an object key so here
	// we rebuild the sortable object, dropping the item that has been
	// deleted.
	//
	// Note this funciton doesn't call setState but returns a change object
	// to call with 'update'. This lets the caller add more state changes
	// before calling setState.
	var newItems = {};
	var items = this.state[this.orderedStateKey];
	for (var id in items) {
	    var item = items[id];
	    if (id !== itemID) {
		newItems[id] = item
	    }
	};
	var changes = {};
	changes[this.orderedStateKey] = {$set: newItems};
	return changes;
    },
    
    getSortableComponent: function () {
	var things = this.getOrderedThings().map(thingID => {
	    var things = this.state[this.orderedStateKey];
	    return (
		<Thing key={thingID} thingID={thingID}>
		    {this.renderSortableThing(thingID)}
		</Thing>
	    );
	});
	return (
	    <BaseSortable components={things}
		    onReorder={this._reorderThings}
		    verify={() => true}
		    />
	);
    },

    _reorderThings: function (components) {
	// The Sortable compenent takes a list of *components* (as opposed to js objects) that can be reordered
	// and calls this callback with the reordered components. Here we use that to
	// reorder the thing descriptions in this.state
	var updates = {};
	components.forEach((c, i) => {
	    var thingID = c.props.thingID;
	    updates[thingID] = {order: {$set: i}};
	});
	var changes = {};
	changes[this.orderedStateKey] = updates;
	this.setState(update(this.state, changes));
    }
    
}

module.exports = Sortable;	    
