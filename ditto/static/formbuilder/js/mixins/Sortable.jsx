/* Wrapper for Khan's Sortable component.

To enable items to be sorted you have to store them as top-level state. E.g.

state = {
    <sortableItemsKey>: {
        <itemId1>: {
            order: <order1>
            <anyOtherProps1>
        },
        <itemId2>: {
            order: <order2>
            <anyOtherProps2>
        },
   }
}

All that's required is that each item has an 'order' property.

For the mixin to work your class needs to supply 'sortableItemsKey' and a method
which returns a component for a given itemID.

var MyClass = React.createClass({
    mixins = [Sortable],

    sortableItemsKey: <sortableItemsKey>

    getSortableItemComponent: function (itemID) {
        ...
    }
    ...
})

The main method exported is

    getSortableComponent

which you use in your render method to render your items with sorting enabled, eg.

render: function () {
    var sortable  = this.getSortableComponent();
    return (
        <div>
            Drag and drop items below to re-order
            {sortable}
        </div>
    }
}

There is also

    getSortedItemIDS

Some helper methods are exposed for adding and deleting items from the
sorted collection

    getMaxOrder
    removeItem

*/
var assign = require("object-assign");
var React = require('react/addons');
var update = React.addons.update;
var BaseSortable = require('react-components/Sortable');

var Sortable = {
    
    getSortableComponent: function () {
	var components = this.getSortedItemIDs().map(itemID => {
	    return (
		<Item key={itemID} itemID={itemID}>
		    {this.getSortableItemComponent(itemID)}
		</Item>
	    );
	});
	return (
	    <BaseSortable components={components}
		    onReorder={this._reorderItems}
		    verify={() => true}
		    />
	);
    },

    getSortedItemIDs: function () {
	var itemIDs = [];
	var items = this._getItems();
	for (var id in items) {
	    itemIDs.push({
		id: id,
		order: items[id].order
	    });
	}
	itemIDs.sort((a, b) => a.order - b.order);
	return itemIDs.map(item => item.id);
    },

    getMaxOrder: function () {
	var maxOrder;
	var sortedItemIDs = this.getSortedItemIDs();
	if (sortedItemIDs.length) {
	    var lastID = sortedItemIDs.slice(-1)[0];
	    var lastItem = this._getItems()[lastID];
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
	var newItems = assign({}, this._getItems());
	delete newItems[itemID];
	return newItems;
    },
    
    _getItems: function () {
	return this.state[this.sortableItemsKey];
    },

    _reorderItems: function (components) {
	// The Sortable compenent takes a list of *components* (as opposed to js objects) that can be resorted
	// and calls this callback with the resorted components. Here we use that to
	// reorder the item descriptions in this.state
	var updates = {};
	components.forEach((c, i) => {
	    var itemID = c.props.itemID;
	    updates[itemID] = {order: {$set: i}};
	});
	var changes = {};
	changes[this.sortableItemsKey] = updates;
	this.setState(update(this.state, changes));
    }
    
}

// Thin wrapper around a sortable item
// so we can store the itemID as a prop
var Item = React.createClass({
    render: function () {
	return (
	    <div draggable={true}>
		{this.props.children}
	    </div>
	);
    }
});

module.exports = Sortable;	    
