var React = require('react');
var TextInput = require('../components/TextInput.jsx');

var CustomTextField = React.createClass({

    render: function () {
	return <TextInput
		       onSave={this.props.onSave}
		       placeholder='Add question text'
		       />;
    }

});

module.exports = CustomTextField;
