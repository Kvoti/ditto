var assign = require("object-assign");
var React = require('react/addons');
var update = React.addons.update;
var Sortable = require('react-components/Sortable');
var Text = require('./Text.jsx');

var FIELD_TYPES = [
    'Text',
    'Paragraph',
    'Yes, no',
    'Yes, no, maybe',
    'Single choice',
    'Multiple choice',
];

// Use an incrementing integer to give each field a unique ID
var _fieldID = 2;  // TODO start at 0, starting at 2 for testing for now!


function getFieldDisplayer(type) {
    return _getFieldComponents(type).Displayer;
}

function getFieldEditor(type) {
    return _getFieldComponents(type).Editor;
}

function _getFieldComponents(type) {
    if (type === 'Text' || true) {
	return Text;
    }
}

var FormBuilder = React.createClass({

    getInitialState: function () {
	return {
	    isEditing: null,
	    form: this.props.form || {
		// dummy fields for now for testing
		f0: {  // TODO this ID should probably come from the user (as part of the field editing widget)
		    type: 'Text',
		    order: 0,
		    props: {
			isRequired: false,
			questionText: "Who's the daddy?"
		    },
		},
		f1: {
		    type: 'Single choice',
		    order: 1,
		    props: {
			isRequired: false,
			questionText: "Favourite rainbow character?",
			choices: ["rod", "jane", "freddy"]
		    },
		},
	    }
	}
    },

    getOrderedFields: function () {
	// For now fields are a flat list but this will probably need
	// to change to support more complex layouts. Not sure how
	// we're going to do the layout part yet...
	var fields = [];
	for (var id in this.state.form) {
	    fields.push({
		id: id,
		field: this.state.form[id]
	    });
	}
	fields.sort((a, b) => a.field.order - b.field.order);
	return fields;
    },
    
    render: function () {
	var fields = this.getOrderedFields().map(this._renderField);
	if (!this.state.isEditing) {
	    // Keep things simple and only allow re-ordering when not editing
	    // any fields
	    fields = (
		<Sortable components={fields}
			onReorder={this._reorderFields}
			verify={() => true}
			/>
	    );
	}
	return (
	    <div>
		{fields}
		{this._newFieldMenu()}
	    </div>
	);
    },

    _renderField: function (field, index) {
	var component, editButton;
	var isEditing = this.state.isEditing === field.id;
	if (isEditing) {
	    // TODO don't like this field.field stuff but not sure how
	    // to better handle sorting fields (prob just pass the field
	    // instead of fieldID to div props?)
	    component = getFieldEditor(field.field.type);
	} else {
	    component = getFieldDisplayer(field.field.type);
	    editButton = <button onClick={this._editField.bind(this, field.id)}>Edit</button>;
	}
	var props = assign({}, field.field.props, {
	    onSave: this._saveField.bind(this, field.id)
	});
	component = React.createElement(component, props);
	return (
	    <div fieldID={field.id} draggable={this.state.isEditing === null} key={field.id}>
		<div className={ isEditing ? 'well' : ''}>
		    {component}
		</div>
	        {editButton}
		<button onClick={this._removeField.bind(this, field.id)}>Remove</button>
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
	var fields = this.getOrderedFields();
	var maxOrder = fields.length ? fields.slice(-1)[0].field.order : -1;
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
    
    _removeField: function (fieldID) {
	// 'update' has no operation to remove an object key so here
	// we rebuild the form object, dropping the field that has been
	// deleted
	var fields = {};
	for (var id in this.state.form) {
	    var field = this.state.form[id];
	    if (id !== fieldID) {
		fields[id] = field
	    }
	};
	var changes = {form: {$set: fields}};
	if (fieldID === this.state.isEditing) {
	    changes.isEditing = {$set: null}
	}
	this.setState(update(this.state, changes));
    },

    _editField: function (fieldID) {
	this.setState({isEditing: fieldID});
    },

    _saveField: function (fieldID, newProps) {
	var changes = {
	    form: {},
	    isEditing: {$set: null}
	};
	changes.form[fieldID] = {props: {$set: newProps}};
	this.setState(update(this.state, changes));
    },

    _reorderFields: function (components) {
	// The Sortable compenent takes a list of *components* (as opposed to js objects) that can be reordered
	// and calls this callback with the reordered components. Here we use that to
	// reorder the field descriptions in this.state
	var updates = {};
	components.forEach((c, i) => {
	    var fieldID = c.props.fieldID;
	    updates[fieldID] = {order: {$set: i}};
	});
	this.setState(update(this.state,
	    {form: updates}
	));
    }
});

module.exports = FormBuilder;
