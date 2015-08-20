var React = require('react/addons');
var update = React.addons.update;
var Button = require('react-bootstrap/lib/Button');
var Icon = require('react-bootstrap/lib/Glyphicon');
var Sortable = require('react-components/Sortable');
var utils = require('../utils/utils');
var Undo = require('./Undo.jsx');

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
	return {config: {
	    questionText: this.props.questionText || '',
	    choices: this.props.choices || ['', '', ''],
	    isRequired: this.props.hasOwnProperty('isRequired') ? this.props.isRequired : false,
	    isMultiple: this.props.hasOwnProperty('isMultiple') ? this.props.isMultiple : false,
	    hasOther: this.props.hasOther || false,
	    otherText: this.props.otherText || 'Other',
	}};
    },

    render: function () {
	var other, done;
	var choices = this.state.config.choices.map(this._renderChoice);
	if (this.state.config.questionText && this._areChoicesValid()) {
	    done = <button onClick={this._onSave}>Done</button>;
	}
	if (this.state.config.hasOther) {
	    other = (
		<p>
		    <label>
			{"Enter 'Other' text "}
			<input
				type='text'
				value={this.state.config.otherText}
				onChange={this._linkText.bind(this, 'otherText')}
				defaultValue="Other"
				/>
		    </label>
		</p>
	    );
	}
	return (
	    <Undo state={this.state.config} onUndo={this._onUndoOrRedo} onRedo={this._onUndoOrRedo}>
		<p>
		    <label>
			{'Required? '}
			<input type="checkbox" checked={this.state.config.isRequired} onChange={this._linkBool.bind(this, 'isRequired')}/>
		    </label>
		</p>
		<p>
		    <label>
			{'Multiple? '}
			<input type="checkbox" checked={this.state.config.isMultiple} onChange={this._linkBool.bind(this, 'isMultiple')}/>
		    </label>
		</p>
		<label>
		    {'Enter question text: '}
		    <input
			    type='text'
			    value={this.state.config.questionText}
			    onChange={this._linkText.bind(this, 'questionText')}
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
			<input type="checkbox" checked={this.state.config.hasOther} onChange={this._linkBool.bind(this, 'hasOther')}/>
		    </label>
		</p>
		{other}
		{done}
	    </Undo>
	);
    },

    _linkText: function (textProp, e) {
	var change = {config: {}};
	change.config[textProp] = {$set: e.target.value};
	this.setState(update(this.state, change));
    },

    _linkBool: function (boolProp, e) {
	var change = {config: {}};
	change.config[boolProp] = {$set: e.target.checked};
	this.setState(update(this.state, change));
    },
    
    _onUndoOrRedo: function (otherState) {
	this.setState({config: otherState});
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
	var changes = {config: {choices: {$push: ['']}}};
	utils.updateState(this, changes);
    },

    _removeChoice: function (index) {
	var changes = {config: {choices: {$splice: [[index, 1]]}}};
	utils.updateState(this, changes);
    },

    _reorderChoices: function (reorderedComponents) {
	// TODO should I be using refs here??
	// (I'm not clear what c is at this point :(
	var newState = {
	    config: {choices: {$set: reorderedComponents.map(c => c.props.choice)}}
	};
	this.setState(update(this.state, newState));
    },
    
    _areChoicesValid: function () {
	return this._hasAtLeastTwoChoices() && !this._hasBlankChoiceInTheMiddle();
    },

    _hasAtLeastTwoChoices: function () {
	return this.state.config.choices.filter(c => c !== '').length > 1;
    },

    _hasBlankChoiceInTheMiddle: function () {
	return !utils.areItemsContiguous(this.state.config.choices);
    },
    
    _onSave: function () {
	var choices = this.state.config.choices.filter(c => c !== '');
	var field = {
	    questionText: this.state.config.questionText,
	    isMultiple: this.state.config.isMultiple,
	    isRequired: this.state.config.isRequired,
	    choices: choices
	}
	if (this.state.config.hasOther) {
	    field.hasOther = true,
	    field.otherText = this.state.config.otherText
	}
	this.props.onSave(field);
    }
});

module.exports = Choice;
