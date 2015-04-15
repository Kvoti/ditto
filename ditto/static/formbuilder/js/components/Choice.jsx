var React = require('react/addons');
var update = React.addons.update;
var Button = require('react-bootstrap/lib/Button');
var Icon = require('react-bootstrap/lib/Glyphicon');
var SortableMixin = require('../mixins/Sortable.jsx');

var Choice = React.createClass({render: function () {}});

Choice.Displayer = React.createClass({
    propTypes: {
	isMultiple: React.PropTypes.bool,
	isRequired: React.PropTypes.bool,
	questionText: React.PropTypes.string,
	choices: React.PropTypes.array,
    },

    render: function () {
	var type = this.props.isMultiple ? 'checkbox' : 'radio';
	var options = this.props.choices.map(option => {
	    return <li key={option}><label><input type={type} name={this.props.questionText} /> {option} </label></li>;
	});
	return (
	    <div>
		<p>{this.props.questionText}{this.props.isRequired ? ' *' : ''}</p>
		<ul>
		    {options}
		</ul>
	    </div>
	);
    }
});

var _choiceID = 0;

function _getChoiceID () {
    var id = 'c' + _choiceID;
    _choiceID += 1;
    return id;
}

Choice.Editor = React.createClass({
    mixins: [
	React.addons.LinkedStateMixin,
	SortableMixin
    ],

    orderedStateKey: 'choices',
    
    propTypes: {
	isMultiple: React.PropTypes.bool,
	isRequired: React.PropTypes.bool,
	questionText: React.PropTypes.string,
	choices: React.PropTypes.array,
    },

    getInitialState: function () {
	return {
	    questionText: this.props.questionText || '',
	    choices: this._setInitialChoices(this.props.choices || ['', '', '']),
	    isRequired: this.props.isRequired || false,
	    isMultiple: this.props.isRequired || false,
	};
    },

    _setInitialChoices: function (choices) {
	var sortableChoices = {}
	choices.forEach((text, i) => {
	    sortableChoices[_getChoiceID()] = {
		order: i,
		text: text
	    }
	});
	return sortableChoices;
    },
	
    render: function () {
	var done;
	var choices = this.getSortableComponent();
	if (this.state.questionText && this._areChoicesValid()) {
	    done = <button onClick={this._onSave}>Done</button>;
	}
	return (
	    <div>
		<input
			type='text'
			valueLink={this.linkState('questionText')}
			placeholder='Enter question text'
	        />
		{choices}
		<p>
	            <Button onClick={this._addChoice}
			    bsStyle='success'
			    ariaLabel='Add choice'
			    title='Add choice'
			    >
			<Icon glyph="plus" />
		    </Button>
		</p>
		<p>
		    <label>
			Required?
			<input type="checkbox" checkedLink={this.linkState('isRequired')} />
		    </label>
		</p>
		{done}
	    </div>
	);
    },

    renderSortableThing: function (choiceID) {
	var choice = this.state.choices[choiceID];
	return (
	    <div>
		<input
			onChange={this._updateChoice.bind(this, choiceID)}
			value={choice.text}
			type='text'
			/>
		<Button onClick={this._removeChoice.bind(this, choiceID)}
			bsStyle='danger'
			ariaLabel='Remove choice'
			title='Remove choice'
			>
		    <Icon glyph="remove" />
		</Button>
	    </div>
	);
    },
    
    _updateChoice: function (choiceID, e) {
	var changes = {choices: {}};
	changes.choices[choiceID] = {text: {$set: e.target.value}};
	this.setState(update(this.state, changes));
    },

    _addChoice: function () {
	var changes = {choices: {}};
	var choiceID = _getChoiceID();
	changes.choices[choiceID] = {$set: {order: this.getMaxOrder() + 1, text: ''}};
	this.setState(update(this.state, changes));
    },

    _removeChoice: function (choiceID) {
	this.setState(update(this.state, this.removeItem(choiceID)));
    },

    _areChoicesValid: function () {
	return this._hasAtLeastTwoChoices() && !this._hasBlankChoiceInTheMiddle();
    },

    _hasAtLeastTwoChoices: function () {
	return this.getOrderedThings().filter(i => i.text !== '').length > 1;
    },

    _hasBlankChoiceInTheMiddle: function () {
	var blank = false;
	var choices = this.getOrderedThings();
	for (var i = 0; i < choices.length; i += 1) {
	    if (blank && choices[i].text) {
		return true;
	    }
	    if (!choices[i].text) {
		blank = true;
	    }
	}
	return false;
    },
    
    _onSave: function () {
	var orderedChoiceIDs = this.getOrderedThings();
	// TODO filter placeholder blanks off the end
	var choices = orderedChoiceIDs.map(id => this.state.choices[id].text);
	this.props.onSave({
	    questionText: this.state.questionText,
	    isMultiple: this.state.isMultiple,
	    isRequired: this.state.isRequired,
	    choices: choices
	});
    }
});

module.exports = Choice;
