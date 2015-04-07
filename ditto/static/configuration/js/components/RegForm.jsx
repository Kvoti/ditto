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
			<div className="col-md-8">
			    <select className="form-control">
				<option>Select {field.name}</option>
				{options}
			    </select>
			</div>
		    );
		} else if (field.hasOwnProperty('fields')) {
		    var required = field.required;
		    fieldComponent = field.fields.map((field, i) => {
			return (
			    <div className="col-md-4" key={i}>
				<input className="form-control" type="text" placeholder={field.name} style={{backgroundColor: required ? '#f5f5f5' : '#fa8072'}} />
			    </div>
			);
		    });
		} else {
		    fieldComponent = (
			<div className="col-md-8">
			    <input className="form-control" type="text" placeholder={field.name} style={{backgroundColor: field.required ? '#f5f5f5' : '#fa8072'}} />
			</div>
		    );
		}
		if (!field.required) {
		    fieldRemove = (
			<button className="btn btn-primary" onClick={this._removeField.bind(this, field)}>
			    <span ariaHidden={true} className="glyphicon glyphicon-minus" />
			    <span className="sr-only">remove</span>
			</button>
		    );
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
		<div className="row" key={i}>
		    {fieldComponent} {fieldRemove}
		</div>		
	    );
	});
	if (fieldsToAdd.length) {
	    fieldsToAdd = (
		<div className="row">
		    <div className="col-md-8">
			<select className="form-control" onChange={this._addField}>
			    <option>Select field to add</option>
			    {fieldsToAdd}
			</select>
		    </div>
		</div>
	    );
	}
	return (
	    <Panel header={header} bsStyle="primary">
		<p>
		<em>
		    Fields in grey are mandatory
		</em>
		</p>
		{fields}
		{fieldsToAdd}
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
