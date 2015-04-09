var React = require('react/addons');
var TextInput = require('../components/TextInput.jsx');
var update = React.addons.update;
var Button = require('react-bootstrap/lib/Button');
var Icon = require('react-bootstrap/lib/Glyphicon');

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
	    var moveUp, moveDown;
	    if (i > 0) {
		moveUp = (
 		    <button onClick={this._moveUp.bind(this, i)}
			    className='btn btn-primary'
			    ariaLabel='Move up'
			    >
			<Icon glyph="arrow-up" />
		    </button>
		);
	    }
	    if (i < this.state.choices.length - 1) {
		moveDown = (
 		    <button onClick={this._moveDown.bind(this, i)}
			    className='btn btn-primary'
			    ariaLabel='Move down'
			    >
			<Icon glyph="arrow-down" />
		    </button>
		);
	    }
	    return (
		<div key={i}>
		    <input
			    type='text'
			    value={choice}
			    onChange={this._updateChoice.bind(this, i)}
			    placeholder={'Choice ' + (i + 1)}
			    />
		    <Button onClick={this._removeChoice.bind(this, i)}
			    bsStyle='danger'
			    ariaLabel='Remove choice'
			    >
			<Icon glyph="remove" />
		    </Button>
		    {moveUp}
		    {moveDown}
		</div>
	    );
	});
	if (this.state.questionText && this._areChoicesValid()) {
	    done = <button onClick={this._save}>Done</button>;
	}
	return (
	    <div className="well">
		<p>Add choice field</p>
		<input
			type='text'
			value={this.state.questionText}
	                onChange={this._updateQuestionText}
			placeholder='Enter question text'
	        />
		{choices}
	        <Button onClick={this._addChoice}
			bsStyle='success'
			ariaLabel='Add choice'
			>
		    <Icon glyph="plus" />
		</Button>
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

    _moveUp: function (i) {
	var before = this.state.choices.slice(0, i - 1);
	var item = this.state.choices[i];
	var prev = this.state.choices[i - 1];
	var after = this.state.choices.slice(i + 1, this.state.choices.length);
	var shuffled = before.concat([item, prev]);
	shuffled = shuffled.concat(after);
	this.setState({choices: shuffled});
    },
    // [1,2,3] i = 1
    _moveDown: function (i) {
	var before = this.state.choices.slice(0, i);
	var item = this.state.choices[i];
	var next = this.state.choices[i + 1];
	var after = this.state.choices.slice(i + 2, this.state.choices.length);
	var shuffled = before.concat([next, item]);
	shuffled = shuffled.concat(after);
	this.setState({choices: shuffled});
    },
    
    _removeChoice: function (i) {
	this.setState(update(this.state, {choices: {$splice: [[i, 1]]}}));
    },

    _areChoicesValid: function () {
	return this._hasAtLeastTwoChoices() && !this._hasBlankChoiceInTheMiddle();
    },

    _hasAtLeastTwoChoices: function () {
	return this.state.choices.filter(i => i !== '').length > 1;
    },

    _hasBlankChoiceInTheMiddle: function () {
	var blank = false;
	var choices = this.state.choices;
	for (var i = 0; i < choices.length; i += 1) {
	    if (blank && choices[i]) {
		return true;
	    }
	    if (!choices[i]) {
		blank = true;
	    }
	}
	return false;
    },
    
    _save: function () {
	this.props.onSave(this.state.questionText, this.state.choices);
	this.setState(this.getInitialState());
    }
});

module.exports = CustomChoiceField;
