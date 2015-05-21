var React = require('react');
var Select = require('react-select');

function search(input, callback) {
    // TODO throttle searches
    if (!input) {
	return
    }
    var url = '/' + DITTO.tenant + '/users/search/'
    $.getJSON(url, {q: input}, function(res) {
	var options = res.map(o => { return {value: o, label: o};});
        callback(null, {
            options: options,
	    // CAREFUL! Only set this to true when there are no more options,
	    // or more specific queries will not be sent to the server.
	    //complete: true
        });
    });
}

var UserAutocomplete = React.createClass({

    render: function () {
	return (
	    <Select
		    name="form-field-name"
		    value="one"
		    placeholder="Enter username"
		    asyncOptions={search}
		    onChange={this.props.onChange}
		    autoload={false}
		    />
	);
    }
});

module.exports = UserAutocomplete;
