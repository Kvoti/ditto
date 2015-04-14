var React = require('react/addons');
var update = React.addons.update;
var Button = require('react-bootstrap/lib/Button');
var Icon = require('react-bootstrap/lib/Glyphicon');

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

Choice.Editor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    propTypes: {
	isMultiple: React.PropTypes.bool,
	isRequired: React.PropTypes.bool,
	questionText: React.PropTypes.string,
	choices: React.PropTypes.array,
    },

    getInitialState: function () {
	return {
	    questionText: this.props.questionText || '',
	    choices: this.props.choices || ['', '', ''],
	    isRequired: this.props.isRequired || false,
	    isMultiple: this.props.isRequired || false,
	};
    },

    render: function () {
	var done;
	var choices = this.state.choices.map((choice, i) => {
	    // TODO this key={i} isn't right here, after re-order same item will
	    // have *different* key, defeating the point
	    return (
		<div key={i}>
		    <input
			    onChange={this._updateChoice.bind(this, i)}
			    value={choice}
			    type='text'
			    placeholder={'Choice ' + (i + 1)}
			    />
		    <Button onClick={this._removeChoice.bind(this, i)}
			    bsStyle='danger'
			    ariaLabel='Remove choice'
			    title='Remove choice'
			    >
			<Icon glyph="remove" />
		    </Button>
		</div>
	    );
	});
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
    
    _onSave: function () {
	this.props.onSave({
	    questionText: this.state.questionText,
	    isMultiple: this.state.isMultiple,
	    isRequired: this.state.isRequired,
	    choices: this.state.choices  // TODO filter blanks
	});
    }
});

module.exports = Choice;
