module.exports = {
    areItemsContiguous: function (items) {
        // check list of items to make sure there are no blanks in the middle
	var blank = false;
        var item;
	for (var i = 0; i < items.length; i += 1) {
	    item = items[i];
	    if (blank && item) {
		return false;
	    }
	    if (!item) {
		blank = true;
	    }
	}
	return true;
    }
}
