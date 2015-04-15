var React = require('react/addons');
var Text = require('./Text.jsx');

var Paragraph = React.createClass({render: function () {}});

Paragraph.Displayer = React.createClass({

    propTypes: {
	questionText: React.PropTypes.string,
	isRequired: React.PropTypes.bool,
    },
	
    render: function () {
	// TODO to add 'for' to label here the field needs an id
	return (
	    <div>
		<label>
		    {this.props.questionText}{this.props.isRequired ? '*' : ''}
		</label>
		<p><textarea /></p>
	    </div>
	);
    }

});

Paragraph.Editor = Text.Editor;

module.exports = Paragraph;
