var React = require('react/addons');
var _ = require('lodash');
var update = React.addons.update;
var utils = require('../utils/utils');
var intRegex = /^\d+$/;

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
    mixins: [React.addons.LinkedStateMixin],
    
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
	return state;
    },
    
    render: function () {
	var done;
	if (this._isValid()) {
	    done = <button onClick={this._onSave}>Done</button>;
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
		<p>Specify scores:</p>
		{this._renderScores()}
		<p>Specify questions:</p>
		{this._renderQuestions()}
		{done}
		</div>
	);
    },

    _renderScores: function () {
	var scores = this.state.scores.map(this._renderScore);
	return <ul>{scores}</ul>;
    },

    _renderScore: function (score, index) {
	var value;
	// TODO add inputs for custom scores for question
	return (
	    <li>
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
		{' (default '}{index}{')'}
	    </li>
	);
    },

    _renderQuestions: function () {
	var questions = this.state.questions.map(this._renderQuestion);
	return <ul>{questions}</ul>;
    },

    _renderQuestion: function (question, index) {
	var value;
	return (
	    <li>
		{'Question '}
		<input
			type="text"
			value={question.text}
			onChange={this._update.bind(this, 'questions', 'text', index)}
			/>
	    </li>
		    
	);

    },

    _update: function (item, prop, index, e) {
	var value = e.target.value;
	var change = buildUpdate([item, index, prop], {$set: value});
	this.setState(update(this.state, change));
    },

    _isValid: function () {
	// TODO leverage browser validation (required, range inputs etc) -- probably
	// good/required for a11y too?
	// Probably get all that for free if using, say, newforms to render this editor
	return (
	    this.state.questionText &&
	    this._hasAtLeastTwoScores() &&
	    this._hasAtLeastOneQuestion() &&
	    this._areScoresContiguous() &&
	    this._areQuestionsContiguous() &&
	    this._hasValueForEachScore()
	);
	// TODO
	// check uniqueness across scores and questions!!
    },

    _hasAtLeastTwoScores: function () {
	return this.state.scores.filter(s => s.label !== '').length > 1;
    },

    _hasAtLeastOneQuestion: function () {
	return this.state.questions.filter(q => q.text !== '').length > 0;
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

    _areAllValuesEmpty: function () {
	var values = this.state.scores.map(s => s.value);
	return utils.areAllValuesEmpty(values);
    },

    _hasIntValueForEachScore: function () {
	return this.state.scores.every(s => {
	    return utils.isBlank(s.label) || intRegex.test(s.value);
	});
    },
    
    _areItemsContiguous: function (item, prop) {
	var items = this.state[item].map(i => i[prop]);
	return utils.areItemsContiguous(items);
    },
    
    _onSave: function () {
	var questionConfig = _.cloneDeep(this.state);
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
