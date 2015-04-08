// TODO factor out common stuff with CaseNotes (and other panels)
var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var TextInput = require('../components/TextInput.jsx');

function getStateFromStores () {
    return {
	settings: SettingsStore.getPostSessionFeedbackSettingsForCurrentRole(),
    }
}

var PostSessionFeedback = React.createClass({
    
    getInitialState: function () {
	var state = getStateFromStores();
	// TODO don't think I need Set here
	// Field switches out of editable mode on blur, which fires when another field is double clicked
	// So only on field is ever editable at a time.
	state.isEditing = new Set();
	return state
    },
    
    componentDidMount: function() {
	SettingsStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
	SettingsStore.removeChangeListener(this._onChange);
    },
    
    render: function () {
	var header = `Editing ‘${this.props.role}’ Post-session feedback`;
	var textFields = {};
	['title', 'question'].forEach(fieldName => {
	    var updateMethod = 'updatePostSessionFeedback' + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);  // TODO capFirst util method?
	    var field;
	    if (this.state.isEditing.has(fieldName)) {
		field = <TextInput
				className="edit"
				onSave={this._onSave.bind(this, fieldName, updateMethod)}
				value={this.state.settings[fieldName]}
				/>;
	    } else {
		field = this.state.settings[fieldName] + ' [edit ' + fieldName + ']';
	    }
	    textFields[fieldName] = field;
	});
	return (
	    <Panel header={header} bsStyle="primary">
		<div className="panel panel-default">
		    <div className="panel-heading" onDoubleClick={this._onDoubleClick.bind(this, 'title')}>
			{textFields.title}
		    </div>
		    <div className="panel-body" onDoubleClick={this._onDoubleClick.bind(this, 'question')}>
			<p>{textFields.question}</p>
			<p>
			    <img alt="1" src="/static/images/ratings/1-rainy.png" />
			    <img alt="2" src="/static/images/ratings/2-cloudy.png" />
			    <img alt="3" src="/static/images/ratings/3-peeping.png" />
			    <img alt="4" src="/static/images/ratings/4-sunny.png" />
			    <img alt="5" src="/static/images/ratings/5-bright.png" />
			</p>
		    </div>
		</div>
	    </Panel>
	);
    },
    
    _onChange: function() {
        this.setState(getStateFromStores());
    },
    
    _onDoubleClick: function(fieldName) {
	var isEditing = this.state.isEditing;
	isEditing.add(fieldName);
	this.setState({isEditing: isEditing});
    },
    
    _onSave: function(field, updateMethod, text) {
	SettingsActionCreators[updateMethod](this.props.role, text);
	// TODO want to use React.update here but it doesn't support set operations
	// Use list push and splice instead (as with chat presence, who's typing etc.?)
	var isEditing = this.state.isEditing;
	isEditing.delete(field);
	this.setState({isEditing: isEditing});
    },
    
});

module.exports = PostSessionFeedback;
