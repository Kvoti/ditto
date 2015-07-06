var React = require('react/addons');
var RoleAndUserSelect = require('../../../configuration/js/components/RoleAndUserSelect.jsx');

var CaseNoteEditor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
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
		<textarea placeholder="Enter note text" valueLink={this.linkState('text')} />
		<p>Select any roles and/or users you want to share this note with.</p>
		<RoleAndUserSelect
			onChangeRoles={this._updateSharing.bind(this, 'shareRoles')}
			onChangeUsers={this._updateSharing.bind(this, 'shareUsers')}
	                selectedRoles={this.state.shareRoles}
			users={this.state.shareUsers}
		/>
		<p>
		    <button
			    disabled={!this.state.text}
			    onClick={this._onSave}
			    >save</button>
		    <button onClick={this.props.onCancel}>cancel</button>
		</p>
	    </div>
	);
    },

    _updateSharing (key, value) {
	var update = {};
	update[key] = value;
	this.setState(update);
    },

    _onSave () {
	this.props.onSave(
	    this.state.text,
	    this.state.shareUsers,
	    this.state.shareRoles
	);
    }

});

module.exports = CaseNoteEditor;
