var React = require('react/addons');
var _ = require('lodash');
var update = React.addons.update;
var utils = require('../utils/utils');
var intRegex = /^\d+$/;
var Sortable = require('react-components/Sortable');
var Undo = require('./Undo.jsx');
var forms = require('newforms');
var flat = require('flat');

var ScoreGroup = React.createClass({render: function () {}});  // TODO this can't be right (maybe just make Displayer this?)

ScoreGroup.Displayer = React.createClass({

    propTypes: {
	questionText: React.PropTypes.string,
	isRequired: React.PropTypes.bool,
	// TODO validate score labels and values are same length
	scores: React.PropTypes.arrayOf(
	    React.PropTypes.shape({
		label: React.PropTypes.string,
		value: React.PropTypes.number
	    })
	),
	questions: React.PropTypes.arrayOf(
	    React.PropTypes.shape({
		text: React.PropTypes.string,
		scores: React.PropTypes.arrayOf(React.PropTypes.number)
	    })
	)
    },
	
    render: function () {
	var scores = this.props.scores || [];
	var scoreLabels = scores.map((score, i) => {
	    var classes = React.addons.classSet({
		'col-md-1': true,
		'col-md-offset-3': i == 0
	    });
	    return (
		<div className={classes}>{score.label}</div>
	    );
	});
	var questions = this.props.questions.map((question, i) => {
	    var scoreInputs = scores.map(score => {
		return (
		    <div className="col-md-1">
			<input name={question.text} type="radio" />
		    </div>
		);
	    });
	    return (
		<div className="row">
		    <div className="col-md-3">{question.text}</div>
		    {scoreInputs}
		</div>
	    );
	});
	return (
	    <div>
		<p>
		    {this.props.questionText}{this.props.isRequired ? '*' : ''}
		</p>
		<div className="row">
		    {scoreLabels}
		</div>
		{questions}
	    </div>
	);
    }

});

ScoreGroup.Editor = React.createClass({
    propTypes: {
	questionText: React.PropTypes.string,
	isRequired: React.PropTypes.bool,
	// TODO validate score labels and values are same length
	scores: React.PropTypes.arrayOf(
	    React.PropTypes.shape({
		label: React.PropTypes.string,
		value: React.PropTypes.number
	    })
	),
	questions: React.PropTypes.arrayOf(
	    React.PropTypes.shape({
		text: React.PropTypes.string,
		scores: React.PropTypes.arrayOf(React.PropTypes.number)
	    })
	),
	onSave: React.PropTypes.func,
    },

    getInitialState: function () {
	var state = _.cloneDeep(this.props);
	// TODO factor out setting of defaults (use getDefaultProps?
	// also could specify number of scores/number of questions in props)
	if (!state.scores) {
	    state.scores = ['', '', ''].map((label, i) => {
		return {
		    label: label,
		}
	    })
	}
	if (!state.questions) {
	    state.questions = ['', '', ''].map((text, i) => {
		return {
		    text: text,
		}
	    })
	}
	///////////
	delete state.onSave;
	return {config: state};
    },

    _getFormFromConfig: function () {
	var config = this.state.config;
	var formData = flat.flatten(config);
	var fields = {};
	for (var k in formData) {
	    if (k === 'questionText') {
		fields[k] = forms.CharField({required: true});
	    } else if (
		k === 'otherText' ||
		k.indexOf('label') !== -1 ||
		k.indexOf('text') !== -1
	    ) {
		fields[k] = forms.CharField({required: false});
	    } else if (k.indexOf('value') !== -1) {
		fields[k] = forms.IntegerField({required: false});
	    } else {
		fields[k] = forms.BooleanField({required: false});
	    }
	}
	fields.clean = function () {
	    var questions = [];
	    var scores = [];
	    for (name in this.cleanedData) {
		if (name.indexOf('questions.') !== -1) {
		    questions.push(this.cleanedData[name]);
		}
		if (name.indexOf('scores.') !== -1) {
		    scores.push(this.cleanedData[name]);
		}
	    }
	    if (!questions.some(q => !utils.isBlank(q))) {
		throw forms.ValidationError(
		    "Please provide at least one question")
	    }
	    if (scores.filter(s => !utils.isBlank(s)).length < 2) {
		throw forms.ValidationError(
		    "Please provide at least two scores")
	    }
	    scores.reverse();
	    var isBlankError = false;
	    scores.forEach((s, i) => {
		if (!utils.isBlank(s)) {
		    isBlankError = true;
		} else if (isBlankError) {
		    this.addError(
			'scores.' + (scores.length - i - 1) + '.label',
			"This score cannot be blank"
		    )
		}
	    });
	}
	var self = this;
	function onChange () {
	    // this isn't a method so that 'this' is the form instance when called
	    var newConfig = flat.unflatten(this.data);  // or cleanedData??
	    self.setState({config: newConfig});
	}
	var Form = forms.Form.extend(fields);
	return new Form({onChange: onChange, data: formData});
    },

    render: function () {
	var editForm = this._getFormFromConfig();
	return (
	    <form>
	    {editForm.nonFieldErrors().render()}
	    {
		editForm.visibleFields().map(bf => {
		    return <forms.FormRow bf={bf} />;
		})
	    }
		<button>Save</button>
	    </form>
	);
	
	var done;
	if (this._isValid()) {
	    done = <p><button onClick={this._onSave}>Done</button></p>;
	}
	return (
	    <Undo state={this.state.config} onUndo={this._onunredo} onRedo={this._onunredo}>
		<p>
		    <label>
			{'Required? '}
			<input type="checkbox" checked={this.state.config.isRequired} onChange={this._updateRequired} />
		    </label>
		</p>
		<label>
		    {'Enter question text: '}
		    <input
			    type='text'
			    value={this.state.config.questionText}
			    onChange={this._updateText}
			    placeholder='Enter question text'
			    />
		</label>
		<p>Specify scores:</p>
		{this._renderScores()}
		<button onClick={this._addScore}>Add</button>
		<p>Specify questions:</p>
		{this._renderQuestions()}
		<button onClick={this._addQuestion}>Add</button>
		{done}
	    </Undo>
	);
    },

    _onunredo: function (otherState) {
	this.setState({config: otherState});
    },
    
    _renderScores: function () {
	var scores = this.state.config.scores.map(this._renderScore);
	return (
 	    <Sortable
		    components={scores}
		    onReorder={this._reorderItems.bind(this, 'scores')}
		    verify={() => true}
		    />
	);
    },

    _renderScore: function (score, index) {
	var value;
	// TODO add inputs for custom scores for question
	return (
	    // TODO key={index} is surely wrong, key should relate to score obj!!
	    <div item={score} key={index} draggable={true}>
		{'Label '}
		<input
			type="text"
			value={score.label}
			onChange={this._update.bind(this, 'scores', 'label', index)}
			/>
		{' Value '}
		<input
			type="number"
			value={score.value}
			onChange={this._update.bind(this, 'scores', 'value', index)}
			/>
		{' (default '}{index}{') '}
		<button onClick={this._removeItem.bind(this, 'scores', index)}>Remove</button>
	    </div>
	);
    },

    _renderQuestions: function () {
	var questions = this.state.config.questions.map(this._renderQuestion);
	return (
 	    <Sortable
		    components={questions}
		    onReorder={this._reorderItems.bind(this, 'questions')}
		    verify={() => true}
		    />
	);
    },

    _renderQuestion: function (question, index) {
	var value;
	return (
	    <div item={question} draggable={true} key={index}>
		{'Question '}
		<input
			type="text"
			value={question.text}
			onChange={this._update.bind(this, 'questions', 'text', index)}
			/>
		<button onClick={this._removeItem.bind(this, 'questions', index)}>Remove</button>
	    </div>
	);
    },

    _updateText: function (e) {
	this.setState(update(this.state, {config: {questionText: {$set: e.target.value}}}));
    },
    
    _updateRequired: function (e) {
	this.setState(update(this.state, {config: {isRequired: {$set: e.target.checked}}}));
    },

    _update: function (item, prop, index, e) {
	var value = e.target.value;
	var change = buildUpdate(['config', item, index, prop], {$set: value});
	this.setState(update(this.state, change));
    },

    _addScore: function () {
	var change = {config: {scores: {$push: [{label: ''}]}}};
	utils.updateState(this, change);
    },

    _addQuestion: function () {
	var change = {config: {questions: {$push: [{text: ''}]}}};
	utils.updateState(this, change);
    },

    _removeItem: function (item, index) {
	var change = buildUpdate(['config', item], {$splice: [[index, 1]]});
	utils.updateState(this, change);
    },

    _reorderItems: function (item, reorderedComponents) {
	var newState = {};
	var change = buildUpdate(['config', item], {$set: reorderedComponents.map(c => c.props.item)});
	utils.updateState(this, change);
    },
    
    _isValid: function () {
	// TODO leverage browser validation (required, range inputs etc) -- probably
	// good/required for a11y too?
	// Probably get all that for free if using, say, newforms to render this editor
	return (
	    this.state.config.questionText &&
	    this._hasAtLeastTwoScores() &&
	    this._hasAtLeastOneQuestion() &&
	    this._areScoresContiguous() &&
	    this._areQuestionsContiguous() &&
	    this._hasValueForEachScore() &&
	    this._areScoresAndQuestionsUnique()
	);
	// TODO
	// check uniqueness across scores and questions!!
    },

    _hasAtLeastTwoScores: function () {
	return this.state.config.scores.filter(s => s.label !== '').length > 1;
    },

    _hasAtLeastOneQuestion: function () {
	return this.state.config.questions.filter(q => q.text !== '').length > 0;
    },

    _areScoresContiguous: function () {
	return (
	    this._areItemsContiguous('scores', 'label') &&
	    this._areItemsContiguous('scores', 'value')
	);
    },
    
    _areQuestionsContiguous: function () {
	return this._areItemsContiguous('questions', 'text');
    },

    _hasValueForEachScore: function () {
	return (
	    this._areAllValuesEmpty() ||
	    this._hasIntValueForEachScore()
	);
    },

    _areScoresAndQuestionsUnique: function () {
	return [
	    ['scores', 'label'],
	    ['scores', 'value'],
	    ['questions', 'text'],
	].every(i => {
	    var [item, prop] = i;
	    var values = this.state.config[item]
		.map(i => i[prop])
		.filter(i => !utils.isBlank(i));
	    return new Set(values).size === values.length;
	});
    },
    
    _areAllValuesEmpty: function () {
	var values = this.state.config.scores.map(s => s.value);
	return utils.areAllValuesEmpty(values);
    },

    _hasIntValueForEachScore: function () {
	return this.state.config.scores.every(s => {
	    return utils.isBlank(s.label) || intRegex.test(s.value);
	});
    },
    
    _areItemsContiguous: function (item, prop) {
	var items = this.state.config[item].map(i => i[prop]);
	return utils.areItemsContiguous(items);
    },
    
    _onSave: function () {
	var questionConfig = _.cloneDeep(this.state.config);
	this.props.onSave(questionConfig);
    },
    
});

// TODO move this to utils
function buildUpdate(keys, change) {
    var update = {};
    var current = update;
    keys.forEach((key, i) => {
	var nested = {};
	if (i === keys.length - 1) {
	    nested = change;
	}
	current[key] = nested;
	current = nested;
    });
    return update;
};

module.exports = ScoreGroup;
