var React = require('react/addons');

var Text = React.createClass({render: function () {}});  // TODO this can't be right (maybe just make Displayer this?)

Text.Displayer = React.createClass({

    propTypes: {
	questionText: React.PropTypes.string,
	isRequired: React.PropTypes.bool,
    },
	
    render: function () {
	return (
	    <p>
		<label>
		    {this.props.questionText}{this.props.isRequired ? '*' : ''}
		    <input type="text" />
		</label>
	    </p>
	);
    }

});

Text.Editor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    // TODO can we share proptypes between the renderer and editor? though
    // they won't share all the same props
    propTypes: {
	questionText: React.PropTypes.string,
	isRequired: React.PropTypes.bool,
	onSave: React.PropTypes.func,
    },

    getInitialState: function() {
	return {
	    questionText: this.props.questionText || '',
	    isRequired: this.props.isRequired || true,
	};
    },
    
    render: function () {
	var done;
	if (this.state.questionText) {
	    done = <button onClick={this._onSave}>Done</button>;
	}
	return (
	    <p>
		<label>
		    Enter question text:
		    <input autoFocus={true} type="text" valueLink={this.linkState('questionText')} />
		</label><br/>
		<label>
		    Required?
		    <input type="checkbox" checkedLink={this.linkState('isRequired')} />
		</label>
		{done}
	    </p>
	);
    },

    _onSave: function () {
	this.props.onSave({
	    questionText: this.state.questionText,
	    isRequired: this.state.isRequired,
	});
    }
});

module.exports = Text;
