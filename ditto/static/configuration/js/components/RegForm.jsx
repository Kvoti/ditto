var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');
var RoleStore = require('../stores/RoleStore');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var CustomField = require('./CustomField.jsx');

function getStateFromStores () {
    return {
	role: RoleStore.getCurrent(),
	settings: SettingsStore.getRegFormSettingsForCurrentRole(),
    }
}

var RegForm = React.createClass({
    
    getInitialState: function () {
	return getStateFromStores();
    },
    
    componentDidMount: function() {
	RoleStore.addChangeListener(this._onChange);
	SettingsStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
	RoleStore.removeChangeListener(this._onChange);
	SettingsStore.removeChangeListener(this._onChange);
    },
    
    render: function () {
	var header = `Editing ‘${this.state.role}’ Registration Form`;
	return (
	    <Panel header={header} bsStyle="primary">
		<p>
		<em>
		    Fields in grey are mandatory
		</em>
		</p>
		{this._renderFields()}
		{this._renderAddableFields()}
		<CustomField role={this.state.role} />
	    </Panel>
	);
    },

    _renderFields: function () {
	var visibleSections = this.state.settings.filter(section => {
	    return section.on || section.required;
	});
	return visibleSections.map(section => {
	    var inputs, removeSection;
	    if (section.hasOwnProperty('fields')) {
		inputs = this._renderFieldGroup(section);
	    } else {
		inputs = (
		    <div className="col-md-8">
			{this._renderField(section)}
		    </div>
		);
	    }
	    if (!section.required) {
		removeSection = this._renderRemoveButton(section);
	    }
	    return (
		<div className="row" key={section.name}>
		    {inputs} {removeSection}
		</div>		
	    );
	});

    },

    _renderAddableFields: function () {
	var addableFields = this.state.settings.filter(section => {
	    return !section.on && !section.required;
	});
	var options = addableFields.map(section => {
	    return <option key={section.name} value={section.name}>{section.name}</option>;
	});
	if (!options.length) {
	    return null;
	}
	return (
	    <div className="row">
		<div className="col-md-8">
		    <select className="form-control" onChange={this._addField}>
			<option>Select field to add</option>
			{options}
		    </select>
		</div>
	    </div>
	);
    },

    _renderFieldGroup: function (sectionSpec) {
	var required = sectionSpec.required;
	var rendered = sectionSpec.fields.map(fieldSpec => {
	    return (
		<div className="col-md-4" key={fieldSpec.name}>
		    {this._renderField(fieldSpec, required)}
		</div>
	    );
	});
	return rendered;
    },
    
    _renderField: function (fieldSpec, required) {
	if (fieldSpec.options) {
	    return this._renderChoiceField(fieldSpec);
	} else {
	    return this._renderTextField(fieldSpec, required);
	};
    },

    _renderChoiceField: function (fieldSpec) {
	var options = fieldSpec.options.map(option => {
	    return <option key={option}>{option}</option>;
	});
	return (
	    <div className="col-md-8">
		<select className="form-control">
		    <option>Select {fieldSpec.name}</option>
		    {options}
		</select>
	    </div>
	);
    },

    _renderTextField: function (fieldSpec, required) {
	return <input className="form-control" type="text" placeholder={fieldSpec.name} style={{backgroundColor: fieldSpec.required || required ? '#f5f5f5' : '#fa8072'}} />
    },

    _renderRemoveButton: function (section) {
	return (
	    <button className="btn btn-primary" onClick={this._removeField.bind(this, section)}>
		<span ariaHidden={true} className="glyphicon glyphicon-minus" />
		<span className="sr-only">remove</span>
	    </button>
	);
    },

    _onChange: function() {
        this.setState(getStateFromStores());
    },
    
    _addField: function (e) {
	var fieldName = e.target.value;
	SettingsActionCreators.addRegField(this.state.role, fieldName);
    },

    _removeField: function (field) {
	SettingsActionCreators.removeRegField(this.state.role, field.name);
    }
});

module.exports = RegForm;
