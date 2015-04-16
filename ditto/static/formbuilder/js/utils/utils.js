var React = require('react/addons');

module.exports = {
    // TODO better names for these utils
    areItemsContiguous: function (items) {
        // check list of items to make sure there are no blanks in the middle
	var blank = false;
        var item;
	for (var i = 0; i < items.length; i += 1) {
	    item = items[i];
	    if (blank && item) {
		return false;
	    }
	    if (this.isBlank(item)) {
		blank = true;
	    }
	}
	return true;
    },

    areAllValuesEmpty: function (values) {
	values = values.filter(i => !this.isBlank(i));
	return !values.length;
    },

    isBlank: function (value) {
        // TODO is this right!!??
        return !value && value !== 0;
    },

    updateState: function (component, stateUpdate) {
	component.setState(
            React.addons.update(component.state, stateUpdate)
        );
    }
}
