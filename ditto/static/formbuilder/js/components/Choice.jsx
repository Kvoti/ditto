var React = require('react/addons');
var update = React.addons.update;
var Button = require('react-bootstrap/lib/Button');
var Icon = require('react-bootstrap/lib/Glyphicon');
var Sortable = require('react-components/Sortable');
var utils = require('../utils/utils');

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

Choice.Editor = React.createClass({
    mixins: [
	React.addons.LinkedStateMixin,
    ],
    
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
	    choices: this.props.choices || ['', '', ''],
	    isRequired: this.props.hasOwnProperty('isRequired') ? this.props.isRequired : false,
	    isMultiple: this.props.hasOwnProperty('isMultiple') ? this.props.isMultiple : false,
	    hasOther: this.props.hasOther || false,
	    otherText: this.props.otherText || 'Other',
	};
    },

    render: function () {
	var other, done;
	var choices = this.state.choices.map(this._renderChoice);
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
		<p>
		    <label>
			{'Multiple? '}
			<input type="checkbox" checkedLink={this.linkState('isMultiple')} />
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
		<Sortable
			components={choices}
			onReorder={this._reorderChoices}
			verify={() => true}
			/>
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

    _renderChoice: function (choice, index) {
	return (
	    <div draggable={true} key={index} choice={choice}>
		<input
			onChange={this._updateChoice.bind(this, index)}
			value={choice}
			type='text'
			/>
		<Button onClick={this._removeChoice.bind(this, index)}
			bsStyle='danger'
			ariaLabel='Remove choice'
			title='Remove choice'
			>
		    <Icon glyph="remove" />
		</Button>
	    </div>
	);
    },
    
    _updateChoice: function (index, e) {
	var changes = {choices: {}};
	changes.choices[index] = {$set: e.target.value};
	utils.updateState(this, changes);
    },

    _addChoice: function () {
	var changes = {choices: {$push: ['']}};
	utils.updateState(this, changes);
    },

    _removeChoice: function (index) {
	var changes = {choices: {$splice: [[index, 1]]}};
	utils.updateState(this, changes);
    },

    _reorderChoices: function (reorderedComponents) {
	// TODO should I be using refs here??
	// (I'm not clear what c is at this point :(
	var newState = {
	    choices: reorderedComponents.map(c => c.props.choice)
	};
	this.setState(newState);
    },
    
    _areChoicesValid: function () {
	return this._hasAtLeastTwoChoices() && !this._hasBlankChoiceInTheMiddle();
    },

    _hasAtLeastTwoChoices: function () {
	return this.state.choices.filter(c => c !== '').length > 1;
    },

    _hasBlankChoiceInTheMiddle: function () {
	return !utils.areItemsContiguous(this.state.choices);
    },
    
    _onSave: function () {
	var choices = this.state.choices.filter(c => c !== '');
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
