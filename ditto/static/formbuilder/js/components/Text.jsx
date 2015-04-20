var React = require('react/addons');
var Undo = require('./Undo.jsx');

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
	    config: {
		questionText: this.props.questionText || '',
		isRequired: this.props.hasOwnProperty('isRequired') ? this.props.isRequired : false,
	    }
	};
    },
    
    render: function () {
	var done;
	if (this.state.config.questionText) {
	    done = <button onClick={this._onSave}>Done</button>;
	}
	return (
	    <Undo state={this.state.config} onUndo={this._unredo} onRedo={this._unredo}>
		<p>
		    <label>
			Enter question text:
			<input autoFocus={true} type="text" value={this.state.config.questionText} onChange={this._updateText} />
		    </label><br/>
		    <label>
			Required?
			<input type="checkbox" value={this.state.config.isRequired} onChange={this._updateRequired} />
		    </label>
		</p>
		{done}
	    </Undo>
	);
    },

    _updateText: function (e) {
	this.setState(React.addons.update(this.state, {config: {questionText: {$set: e.target.value}}}));
    },
    
    _updateRequired: function (e) {
	this.setState(React.addons.update(this.state, {config: {isRequired: {$set: e.target.checked}}}));
    },

    _unredo: function (otherState) {
	this.setState({config: otherState});
    },
    
    _onSave: function () {
	this.props.onSave({
	    questionText: this.state.config.questionText,
	    isRequired: this.state.config.isRequired,
	});
    }
});

module.exports = Text;
