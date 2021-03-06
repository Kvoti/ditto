// You're not building a form builder, are you!!?
var React = require('react');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var CustomTextField = require('./CustomTextField.jsx');
var CustomChoiceField = require('./CustomChoiceField.jsx');

var CustomField = React.createClass({
    addTextField: function (questionText) {
	if (questionText) {
	    SettingsActionCreators.addTextField(this.props.role, questionText);
	    this.setState({adding: null});
	}
    },

    addChoiceField: function (questionText, choices) {
	SettingsActionCreators.addChoiceField(this.props.role, questionText, choices);
	this.setState({adding: null});
    },
    
    addMultipleChoiceField: function (questionText, choices) {
	SettingsActionCreators.addMultipleChoiceField(this.props.role, questionText, choices);
	this.setState({adding: null});
    },

    FIELD_TYPES: [
	{
	    name: 'Text',
	    widget: CustomTextField,
	    creator: 'addTextField',
	},
	//'Long text',
	{
	    
	    name: 'Single choice',
	    widget: CustomChoiceField,
	    creator: 'addChoiceField',
	},
	{
	    
	    name: 'Multiple choice',
	    widget: CustomChoiceField,
	    creator: 'addMultipleChoiceField',
	}
    ],

    // TODO urgh, this again, want an ordered dict or something
    getFieldType: function (fieldType) {
	var match = this.FIELD_TYPES.filter(i => {
	    return i.name == fieldType;
	});
	return match[0];
    },
    //////////
    
    getInitialState: function () {
	return {adding: null}
    },
    
    render: function () {
	var addNewField, newFieldWidget, fieldType, cancelButton;
	var fieldChoices = this.FIELD_TYPES.map(field => {
	    var fieldType = field.name;
	    return <option key={fieldType} value={fieldType}>{fieldType}</option>;
	});
	if (!this.state.adding) {
	    addNewField = (
		<select onChange={this._addField} className="form-control">
		    <option>Add new custom field</option>
		    {fieldChoices}
		</select>
	    );
	} else {
	    fieldType = this.getFieldType(this.state.adding);
	    newFieldWidget = React.createElement(
		fieldType.widget,
		{onSave: this[fieldType.creator]}
	    )
		cancelButton = <button onClick={this._cancelAddField} className="btn btn-primary">Cancel</button>
	}	  
	return (
	    <div>
		{addNewField}
		{newFieldWidget}
		{cancelButton}
	    </div>
	);
    },

    _addField: function (e) {
	var fieldType = e.target.value;
	this.setState({adding: fieldType});
    },

    _cancelAddField: function () {
	this.setState({adding: null});
    }

});

module.exports = CustomField;
