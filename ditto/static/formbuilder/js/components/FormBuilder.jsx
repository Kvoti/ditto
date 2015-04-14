var React = require('react/addons');
var update = React.addons.update;
var Sortable = require('react-components/Sortable');

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

var FormBuilder = React.createClass({

    getInitialState: function () {
	return {
	    isEditing: null,
	    form: this.props.form || {
		// dummy fields for now for testing
		f0: {  // TODO this ID should probably come from the user (as part of the field editing widget)
		    type: 'Text',
		    order: 0,
		},
		f1: {
		    type: 'Single choice',
		    order: 1,
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
	    console.log(id, typeof(id));
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
	console.log(field.id, this.state.isEditing, typeof(field.id), typeof(this.state.isEditing));
	return (
	    <div fieldID={field.id} draggable={this.state.isEditing === null} key={field.id} className={this.state.isEditing === field.id ? 'well' : ''}>
		{field.field.label || field.field.type}
	        <p>
		    <button onClick={this._removeField.bind(this, field.id)}>Remove</button>
		</p>
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
