var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');
var RoleStore = require('../stores/RoleStore');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');

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
	var fieldsToAdd = [];
	var fields = this.state.settings.map((field, i) => {
	    var fieldComponent, fieldRemove, options;
	    if (field.on || field.required) {
		if (field.options) {
		    options = field.options.map(option => {
			return <option>{option}</option>;
		    });
		    fieldComponent = (
			<select>
			    <option>Select {field.name}</option>
			    {options}
			</select>
		    );
		} else if (field.hasOwnProperty('fields')) {
		    var required = field.required;
		    fieldComponent = field.fields.map(field => {
			return <input type="text" placeholder={field.name} style={{backgroundColor: required ? 'grey' : 'orange'}} />;
		    });
		} else {
		    fieldComponent = <input type="text" placeholder={field.name} style={{backgroundColor: field.required ? 'grey' : 'orange'}} />;
		}
		if (!field.required) {
		    fieldRemove = <button onClick={this._removeField.bind(this, field)}>remove</button>;
		}
	    } else {
		if (!field.required) {
		    fieldsToAdd.push(
			<option key={i} value={field.name}>{field.name}</option>
		    );
		}
		return null;
	    }
	    return (
		<div key={i}>
		    {fieldComponent} {fieldRemove}
		</div>		
	    );
	});
	if (fieldsToAdd.length) {
	    fieldsToAdd = (
		<select onChange={this._addField}>
		    <option>Select field to add</option>
		    {fieldsToAdd}
		</select>
	    );
	}
	return (
	    <Panel header={header} bsStyle="primary">
		<p>
		<em>
		    Fields in grey are mandatory
		</em>
		</p>
		<Row>
		    {fields}
		    {fieldsToAdd}
		</Row>
	    </Panel>
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
