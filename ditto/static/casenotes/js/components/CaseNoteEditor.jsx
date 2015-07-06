var React = require('react/addons');
var RoleAndUserSelect = require('../../../configuration/js/components/RoleAndUserSelect.jsx');

var CaseNoteEditor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    getInitialState () {
	return {
	    text: this.props.initialText || "",
	    shareRoles: this.props.initialShareRoles || [],
	    shareUsers: this.props.initialShareUsers || []
	};
    },
    
    render () {
	return (
	    <div>
		<textarea className="form-control" placeholder="Enter note text" valueLink={this.linkState('text')} />
		<p>Select any roles and/or users you want to share this note with.</p>
		<RoleAndUserSelect
			onChangeRoles={this._updateSharing.bind(this, 'shareRoles')}
			onChangeUsers={this._updateSharing.bind(this, 'shareUsers')}
	                selectedRoles={this.state.shareRoles}
			users={this.state.shareUsers}
		/>
		<p>
		    <button
			    className="btn btn-success"
			    disabled={!this.state.text}
			    onClick={this._onSave}
			    >save</button>
		    <button
			    className="btn btn-default"
			    onClick={this._onCancel}>cancel</button>
		</p>
	    </div>
	);
    },

    _onCancel () {
	this.setState(this.getInitialState());
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
	this.setState({
	    text: "",
	    shareRoles: [],
	    shareUsers: []
	});
    }

});

module.exports = CaseNoteEditor;
