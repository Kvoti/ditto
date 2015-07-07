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
    getDefaultProps () {
	return {
	    name: 'user-autocomplete'
	};
    },

    render: function () {
	return (
	    <Select
		    name={this.props.name}
		    value={this._value()}
		    placeholder="Enter username"
		    asyncOptions={search}
		    onChange={this.props.onChange ? this._onChange : null}
		    autoload={false}
	            delimiter={'|'}
	            multi={this.props.multi}
		    />
	);
    },

    _value () {
	console.log('xx', this.props.multi, this.props.value);
	if (this.props.multi) {
	    if (this.props.value && this.props.value.length) {
		return this.props.value.join('|');
	    } else {
		return null
	    }
	} else {
	    return this.props.value;
	}
    },
    
    _onChange (users) {
	var userList;
	if (users) {
	    userList = users.split('|');
	} else {
	    userList = "";
	}
	this.props.onChange(userList);
    }

});

module.exports = UserAutocomplete;
