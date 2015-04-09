var React = require('react/addons');
var TextInput = require('../components/TextInput.jsx');
var update = React.addons.update;

var CustomChoiceField = React.createClass({

    getInitialState: function () {
	return {
	    choices: ['', '', ''],
	    questionText: '',
	};
    },

    render: function () {
	var done;
	var choices = this.state.choices.map((choice, i) => {
	    // key={i} ok here *I think*
	    return (
		<div key={i}>
		    <input
			    type='text'
			    value={choice}
			    onChange={this._updateChoice.bind(this, i)}
			    />
		    <button onClick={this._removeChoice.bind(this, i)}>remove</button>
		</div>
	    );
	});
	if (this.state.questionText && this.state.choices.filter(i => i !== '').length) {
	    done = <button onClick={this._save}>Done</button>;
	}
	return (
	    <div>
		<input
			type='text'
			value={this.state.questionText}
	                onChange={this._updateQuestionText}
	        />
		{choices}
	        <button onClick={this._addChoice}>Add</button>
		{done}
	    </div>
	);
    },

    _updateQuestionText: function (e) {
	this.setState({questionText: e.target.value});
    },
    
    _updateChoice: function (i, e) {
	var change = {};
	change[i] = {$set: e.target.value};
	this.setState(update(this.state, {choices: change}));
    },

    _addChoice: function () {
	this.setState(update(this.state, {choices: {$push: ['']}}));
    },

    _removeChoice: function (i) {
	this.setState(update(this.state, {choices: {$splice: [[i, 1]]}}));
    },

    _save: function () {
	this.props.onSave(this.state.questionText, this.state.choices);
	this.setState(this.getInitialState());
    }
});

module.exports = CustomChoiceField;
