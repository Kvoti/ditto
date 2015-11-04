var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');
var RoleStore = require('../stores/RoleStore');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var CustomField = require('./CustomField.jsx');
var CustomChoiceField = require('./CustomChoiceField.jsx');

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
	if (!this.state.settings) {
	    // TODO have a feeling RegForm should get config from props passed in
	    return (
		<Panel header={header} bsStyle="primary">
		    Loading...
		</Panel>
	    );
	}
	return (
	    <Panel header={header} bsStyle="primary">
		<p>
		<em>Fields in grey are mandatory</em>
		</p>
		<div className="form-horizontal">
		<div className="form-group">
		    <div className="col-md-8">
			<input className="form-control" placeholder="Username" style={{backgroundColor: '#f5f5f5'}} />
		    </div>
		</div>
		<div className="form-group">
		    <div className="col-md-8">
			<input className="form-control" placeholder="Email address" style={{backgroundColor: '#f5f5f5'}} />
		    </div>
		</div>
		<div className="form-group">
		    <div className="col-md-4">
			<input className="form-control" placeholder="Password" style={{backgroundColor: '#f5f5f5'}} />
		    </div>
		    <div className="col-md-4">
			<input className="form-control" placeholder="Verify password" style={{backgroundColor: '#f5f5f5'}} />
		    </div>
		</div>
		{this._renderFields()}
		{this._renderAddableFields()}
		<CustomField role={this.state.role} />
		</div>
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
		<div className="form-group" key={section.name}>
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
	    <div className="form-group">
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

    // TODO probably makes sense to make Field components that know how to render
    // themselves in display and edit mode
    _renderChoiceField: function (fieldSpec) {
	if (this.state.isEditing && this.state.isEditing.name === fieldSpec.name) {
	    return React.createElement(
		CustomChoiceField,
		{
		    questionText: fieldSpec.name,
		    choices: fieldSpec.options,
		    onSave: this._updateChoiceField.bind(this, fieldSpec.name),
		}
	    );
	}
	var type = fieldSpec.multiple ? 'checkbox' : 'radio';
	var options = fieldSpec.options.map(option => {
	    return <div key={option}><label><input type={type} name={fieldSpec.name} /> {option} </label></div>;
	});
	return (
	    <div className="col-md-8">
		<p onDoubleClick={this._editField.bind(this, fieldSpec)}>{fieldSpec.name}</p>
		{options}
	    </div>
	);
    },

    _editField: function (fieldSpec) {
	this.setState({isEditing: fieldSpec});
    },

    _updateChoiceField: function (oldName, questionText, choices) {
	SettingsActionCreators.updateChoiceField(
	    this.state.role,
	    oldName,
	    questionText,
	    choices
	);
	this.setState({isEditing: null});
    },
    
    _renderTextField: function (fieldSpec, required) {
	return <input className="form-control" type="text" placeholder={fieldSpec.name} style={{backgroundColor: fieldSpec.required || required ? '#f4c1cf' : '#fa8072'}} />
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
