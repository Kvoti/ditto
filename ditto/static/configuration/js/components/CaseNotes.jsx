var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');
var RoleStore = require('../stores/RoleStore');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var TextInput = require('../components/TextInput.jsx');

function getStateFromStores () {
    return {
	role: RoleStore.getCurrent(),
	settings: SettingsStore.getCaseNotesSettingsForCurrentRole(),
    }
}

var CaseNotes = React.createClass({
    
    getInitialState: function () {
	var state = getStateFromStores();
	state.isEditing = false;
	return state
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
	var header = `Editing ‘${this.state.role}’ Case Notes`;
	var title;
	if (this.state.isEditing) {
	    title =
            <TextInput
		    className="edit"
		    onSave={this._onSave}
		    value={this.state.settings.title}
		    />;
	} else {
	    title = this.state.settings.title + ' [edit title]';
	}
	return (
	    <Panel header={header}>
		<em>Case notes appear on a person’s profile page. You can call them something else, and professionals can share them with other roles.</em>
		<p onDoubleClick={this._onDoubleClick}>{title}</p>
	    </Panel>
	);
    },
    
    _onChange: function() {
        this.setState(getStateFromStores());
    },
    
    _onDoubleClick: function() {
	this.setState({isEditing: true});
    },
    
    _onSave: function(text) {
	SettingsActionCreators.updateCaseNotesTitle(this.state.role, text);
	this.setState({isEditing: false});
    },
    
});

module.exports = CaseNotes;
