var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var TextInput = require('../components/TextInput.jsx');

var CaseNotes = React.createClass({
    
    getStateFromStores: function () {
	return {
	    settings: SettingsStore.getCaseNotesSettingsForRole(this.props.role),
	}
    },

    getInitialState: function () {
	var state = this.getStateFromStores();
	state.isEditing = false;
	return state
    },
    
    componentDidMount: function() {
	SettingsStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
	SettingsStore.removeChangeListener(this._onChange);
    },
    
    render: function () {
	var header = `Editing ‘${this.props.role}’ Case Notes`;
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
	    <Panel header={header} bsStyle="primary">
		<em>Case notes appear on a person’s profile page. You can call them something else, and professionals can share them with other roles.</em>

		<div className="panel panel-default">
		    <div className="panel-heading" onDoubleClick={this._onDoubleClick}>
			{title}
		    </div>
		    <div style={{height:200}} className="panel-body">
		    </div>
		</div>
	    </Panel>
	);
    },
    
    _onChange: function() {
        this.setState(this.getStateFromStores());
    },
    
    _onDoubleClick: function() {
	this.setState({isEditing: true});
    },
    
    _onSave: function(text) {
	SettingsActionCreators.updateCaseNotesTitle(this.props.role, text);
	this.setState({isEditing: false});
    },
    
});

module.exports = CaseNotes;
