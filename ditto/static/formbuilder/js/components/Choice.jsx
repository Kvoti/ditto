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
	hasOther: React.PropTypes.bool,
	questionText: React.PropTypes.string,
	choices: React.PropTypes.array,
	otherText: React.PropTypes.string,
    },

    render: function () {
	var other;
	var type = this.props.isMultiple ? 'checkbox' : 'radio';
	var options = this.props.choices.map(option => {
	    return (
		<li key={option}>
		    <label>
			<input type={type} name={this.props.questionText} />
			{option}
		    </label>
		</li>
	    );
	});
	if (this.props.hasOther) {
	    other = (
		<label>
		    {this.props.otherText || 'Other'}:{' '}
		    <input type="text" />
		</label>
	    );
	}
	return (
	    <div>
		<p>{this.props.questionText}{this.props.isRequired ? ' *' : ''}</p>
		<ul>
		    {options}
		</ul>
		{other}
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

    sortableItemsKey: 'choices',
    
    propTypes: {
	isMultiple: React.PropTypes.bool,
	isRequired: React.PropTypes.bool,
	hasOther: React.PropTypes.bool,
	questionText: React.PropTypes.string,
	choices: React.PropTypes.array,
	otherText: React.PropTypes.string,
	onSave: React.PropTypes.func,
    },

    getInitialState: function () {
	return {
	    questionText: this.props.questionText || '',
	    choices: this._setInitialChoices(this.props.choices || ['', '', '']),
	    isRequired: this.props.isRequired || false,
	    isMultiple: this.props.isRequired || false,
	    hasOther: this.props.hasOther || false,
	    otherText: this.props.otherText || 'Other',
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
	var other, done;
	var choices = this.getSortableComponent();
	if (this.state.questionText && this._areChoicesValid()) {
	    done = <button onClick={this._onSave}>Done</button>;
	}
	if (this.state.hasOther) {
	    other = (
		<p>
		    <label>
			{"Enter 'Other' text "}
			<input
				type='text'
				valueLink={this.linkState('otherText')}
				defaultValue="Other"
				/>
		    </label>
		</p>
	    );
	}
	return (
	    <div>
		<p>
		    <label>
			{'Required? '}
			<input type="checkbox" checkedLink={this.linkState('isRequired')} />
		    </label>
		</p>
		<label>
		    {'Enter question text: '}
		    <input
			    type='text'
			    valueLink={this.linkState('questionText')}
			    placeholder='Enter question text'
			    />
		</label>
		<p>Specify choices:</p>
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
			{'Has other? '}
			<input type="checkbox" checkedLink={this.linkState('hasOther')} />
		    </label>
		</p>
		{other}
		{done}
	    </div>
	);
    },

    getSortableItemComponent: function (choiceID) {
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
	this.setState({choices: this.removeItem(choiceID)});
    },

    _areChoicesValid: function () {
	return this._hasAtLeastTwoChoices() && !this._hasBlankChoiceInTheMiddle();
    },

    _hasAtLeastTwoChoices: function () {
	return this.getSortedItemIDs().filter(id => this.state.choices[id].text !== '').length > 1;
    },

    _hasBlankChoiceInTheMiddle: function () {
	var blank = false;
	var choices = this.state.choices;
	var choiceIDs = this.getSortedItemIDs();
	var choice;
	for (var i = 0; i < choiceIDs.length; i += 1) {
	    choice = choices[choiceIDs[i]];
	    if (blank && choice.text) {
		return true;
	    }
	    if (!choice.text) {
		blank = true;
	    }
	}
	return false;
    },
    
    _onSave: function () {
	var orderedChoiceIDs = this.getSortedItemIDs();
	// TODO filter placeholder blanks off the end
	var choices = orderedChoiceIDs.map(id => this.state.choices[id].text);
	var field = {
	    questionText: this.state.questionText,
	    isMultiple: this.state.isMultiple,
	    isRequired: this.state.isRequired,
	    choices: choices
	}
	if (this.state.hasOther) {
	    field.hasOther = true,
	    field.otherText = this.state.otherText
	}
	this.props.onSave(field);
    }
});

module.exports = Choice;
