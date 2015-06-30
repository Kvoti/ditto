var React = require('react');
var RoleAndUserSelect = require('../../../configuration/js/components/RoleAndUserSelect.jsx');

var CaseNoteEditor = React.createClass({
    getInitialState () {
	return {
	    text: this.props.initialText,
	    shareRoles: this.props.initialShareRoles || [],
	    shareUsers: this.props.initialShareUsers || []
	};
    },
    
    render () {
	return (
	    <div>
		<textarea placeholder="Enter note text" />
		<p>Select any roles and/or users you want to share this note with.</p>
		<RoleAndUserSelect
			onChangeRoles={this._updateSharing.bind(this, 'shareRoles')}
			onChangeUsers={this._updateSharing.bind(this, 'shareUsers')}
	                selectedRoles={this.state.shareRoles}
			users={this.state.shareUsers}
		/>
		<p>
		    <button>save</button>
		    <button onClick={this.props.onCancel}>cancel</button>
		</p>
	    </div>
	);
    },

    _updateSharing (key, value) {
	var update = {};
	update[key] = value;
	this.setState(update);
    }
});

module.exports = CaseNoteEditor;
