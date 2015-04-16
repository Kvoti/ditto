var assign = require("object-assign");
var React = require('react/addons');
var update = React.addons.update;
var Sortable = require('../mixins/Sortable.jsx');
var Text = require('./Text.jsx');
var Choice = require('./Choice.jsx');
var Paragraph = require('./Paragraph.jsx');
var ScoreGroup = require('./ScoreGroup.jsx');

var FIELD_TYPES = [
    'Text',
    'Paragraph',
//    'Yes, no',
//    'Yes, no, maybe',
    'Choice',
    'Score group',
];

// Use an incrementing integer to give each field a unique ID
var _fieldID = 4;  // TODO start at 0, starting at N for testing for now!

var FormBuilder = React.createClass({
    mixins: [Sortable],

    sortableItemsKey: 'form',
    
    getInitialState: function () {
	return {
	    isEditing: null,
	    form: this.props.form || {
		// dummy fields for now for testing
		f0: {  // TODO this ID should probably come from the user (as part of the field editing widget)
		    type: 'Text',
		    order: 0,
		    props: {
			questionText: "Who's the daddy?"
		    }
		},
		f1: {
		    type: 'Choice',
		    order: 1,
		    props: {
			isRequired: false,
			isMultiple: true,
			questionText: "Favourite Rainbow characters?",
			choices: ["rod", "jane", "freddy"],
			hasOther: true,
			otherText: "Other"
		    },
		},
		f2: {
		    type: 'Paragraph',
		    order: 2,
		    props: {
			questionText: 'Please enter your life story'
		    }
		},
		f4: {
		    type: 'Score group',
		    order: 3,
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
		}
	    }
	}
    },
    
    render: function () {
	var fields;
	if (!this.state.isEditing) {
	    // Keep things simple and only allow re-ordering when not editing
	    // any fields
	    fields = this.getSortableComponent();
	} else {
	    fields = this.getSortedItemIDs().map(this.getSortableItemComponent);
	}
	return (
	    <div>
		{fields}
		{this._newFieldMenu()}
	    </div>
	);
    },

    getSortableItemComponent: function (fieldID) {
	var component, editButton, cancelButton;
	var field = this.state.form[fieldID];
	var isEditingThisField = this.state.isEditing === fieldID;
	if (isEditingThisField) {
	    component = getFieldEditor(field.type);
	    // TODO cancel button could live with field editor, then we can
	    // detect/warn about un-applied changes
	    cancelButton = <button onClick={this._cancelEditField}>Cancel</button>;
	} else {
	    component = getFieldDisplayer(field.type);
	}
	if (!this.state.isEditing) {
	    editButton = <button onClick={this._editField.bind(this, fieldID)}>Edit</button>;
	}
	var props = assign({}, field.props, {
	    onSave: this._saveField.bind(this, fieldID)
	});
	component = React.createElement(component, props);
	return (
	    <div fieldID={fieldID} key={fieldID}>
		<div className={ isEditingThisField ? 'well' : ''}>
		    {component}
		</div>
	        {editButton}{cancelButton}
		<button onClick={this._removeField.bind(this, fieldID)}>Remove</button>
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
	var maxOrder = this.getMaxOrder();
	var order = maxOrder + 1;
	var newFieldType = e.target.value;
	var id = 'f' + _fieldID;
	_fieldID += 1;
	e.target.value = '';
	var changes = {
	    isEditing: {$set: id},
	    form: {}
	};
	changes.form[id] = {$set: {
	    type: newFieldType,
	    order: order
	}};
	this.setState(update(this.state, changes));
    },
    
    _editField: function (fieldID) {
	this.setState({isEditing: fieldID});
    },

    _cancelEditField: function () {
	this.setState({isEditing: null});
    },

    _removeField: function (fieldID) {
	var fields = this.removeItem(fieldID);
	var changes = {form: {$set: fields}};
	if (fieldID === this.state.isEditing) {
	    changes.isEditing = {$set: null}
	}
	this.setState(update(this.state, changes));
    },

    _saveField: function (fieldID, newProps) {
	var changes = {
	    form: {},
	    isEditing: {$set: null}
	};
	changes.form[fieldID] = {props: {$set: newProps}};
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
