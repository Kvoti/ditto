var assign = require("object-assign");
var React = require('react/addons');
var update = React.addons.update;
var Sortable = require('react-components/Sortable');
var Text = require('./Text.jsx');
var Choice = require('./Choice.jsx');
var Paragraph = require('./Paragraph.jsx');
var ScoreGroup = require('./ScoreGroup.jsx');
var utils = require('../utils/utils');
var Undo = require('./Undo.jsx');

var FIELD_TYPES = [
    'Text',
    'Paragraph',
//    'Yes, no',
//    'Yes, no, maybe',
    'Choice',
    'Score group',
];

var FormBuilder = React.createClass({

    getInitialState: function () {
	return {
	    isEditing: 1,
	    form: this.props.form || [
		// dummy fields for now for testing
		{
		    type: 'Score group',
		    props: {
			questionText: 'Please rate the following',
			scores: [
			    {label: 'Disagree'},
			    {label: 'Unsure'},
			    {label: 'Agree'},
			],
			questions: [
			    {text: 'Mark is awesome'},
			    {text: 'React is awesome'},
			    {text: 'Porto is awesome'}
			]
		    }
		},
		{
		    type: 'Text',
		    props: {
			questionText: "Who's the daddy?"
		    }
		},
		{
		    type: 'Choice',
		    props: {
			isRequired: false,
			isMultiple: true,
			questionText: "Favourite Rainbow characters?",
			choices: ["rod", "jane", "freddy"],
			hasOther: true,
			otherText: "Other"
		    },
		},
		{
		    type: 'Paragraph',
		    props: {
			questionText: 'Please enter your life story'
		    }
		},
	    ]
	}
    },
    
    render: function () {
	var fields = this.state.form.map(this._renderField);
	if (!this.state.isEditing) {
	    // Keep things simple and only allow re-ordering when not editing
	    // any fields
 	    fields = (
		<Sortable
			components={fields}
			onReorder={this._reorderFields}
			verify={() => true}
			/>
		);
	}
	return (
	    <Undo state={this.state.form} onUndo={this._onUndo} onRedo={this._onUndo}>
		{fields}
		{this._newFieldMenu()}
	    </Undo>
	);
    },

    _onUndo: function (prevState) {
	this.setState({form: prevState});
    },
    
    _renderField: function (field, index) {
	var component, editButton, cancelButton;
	var isEditingThisField = this.state.isEditing === index;
	if (isEditingThisField) {
	    component = getFieldEditor(field.type);
	    // TODO cancel button could live with field editor, then we can
	    // detect/warn about un-applied changes
	    cancelButton = <button onClick={this._cancelEditField}>Cancel</button>;
	} else {
	    component = getFieldDisplayer(field.type);
	}
	if (!this.state.isEditing) {
	    editButton = <button onClick={this._editField.bind(this, index)}>Edit</button>;
	}
	var props = assign({}, field.props, {
	    onSave: this._saveField.bind(this, index)
	});
	component = React.createElement(component, props);
	return (
	    <div draggable={!this.state.isEditing} field={field} key={index} style={{border: '2px solid #f8f8f8',padding: 5}}>
		<div className={isEditingThisField ? 'well' : ''}>
		    {component}
		</div>
	        {editButton}{cancelButton}
		<button onClick={this._removeField.bind(this, index)}>Remove</button>
	    </div>
	);
    },

    _newFieldMenu: function () {
	var options = FIELD_TYPES.map(option => {
	    return <option key={option} value={option}>{option}</option>;
	});
	return (
	    <select onChange={this._addField}>
		<option value="">Select field type to add</option>
		{options}
	    </select>
	);
    },

    _addField: function (e) {
	var newFieldType = e.target.value;
	e.target.value = '';
	var changes = {
	    isEditing: {$set: this.state.form.length},
	    form: {$push: [{
		type: newFieldType,
	    }]}
	};
	utils.updateState(this, changes);
    },
    
    _editField: function (index) {
	this.setState({isEditing: index});
    },

    _cancelEditField: function () {
	this.setState({isEditing: null});
    },

    _removeField: function (index) {
	var changes = {form: {$splice: [[index, 1]]}};
	if (index === this.state.isEditing) {
	    changes.isEditing = {$set: null}
	}
	utils.updateState(this, changes);
    },
    
    _reorderFields: function (reorderedComponents) {
	// TODO should I be using refs here??
	// (I'm not clear what c is at this point :(
	var newState = {
	    form: reorderedComponents.map(c => c.props.field)
	};
	this.setState(newState, function () { console.log(newState.form === this.state.form) });
    },
    
    _saveField: function (index, newProps) {
	var changes = {
	    form: {},
	    isEditing: {$set: null}
	};
	changes.form[index] = {props: {$set: newProps}};
	this.setState(update(this.state, changes));
    },

});

function getFieldDisplayer(type) {
    return _getFieldComponents(type).Displayer;
}

function getFieldEditor(type) {
    return _getFieldComponents(type).Editor;
}

function _getFieldComponents(type) {
    if (type === 'Text') {
	return Text;
    } else if (type === 'Choice') {
	return Choice;
    } else if (type === 'Paragraph') {
	return Paragraph;
    } else if (type === 'Score group') {
	return ScoreGroup;
    }
}

module.exports = FormBuilder;
