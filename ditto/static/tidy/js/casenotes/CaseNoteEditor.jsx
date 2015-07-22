import Validate from '../lib/form/Validate.jsx';

var React = require('react/addons');
var RoleAndUserSelect = require('../../../configuration/js/components/RoleAndUserSelect.jsx');

var CaseNoteEditor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    getInitialState () {
	return {
	    text: this.props.initialText || "",
	    title: this.props.initialText || "",
	    shareRoles: this.props.initialShareRoles || [],
	    shareUsers: this.props.initialShareUsers || []
	};
    },
    
    render () {
	return (
	    <div>
		<Validate
			id="title"
			isRequired={true}
			messages={{isRequired: 'Please enter a title'}}
			>
		    <input className="form-control" placeholder="Enter note title" value={this.state.title} onChange={this._updateSharing.bind(this, 'title')} />
		</Validate>
		<Validate
	                id="text"
			isRequired={true}
			maxWords={150}
			>
		    <textarea className="form-control" placeholder="Enter note text" value={this.state.text} onChange={this._updateSharing.bind(this, 'text')} />
		</Validate>
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
			    disabled={!this.state.text || !this.state.title}
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
	    this.state.title,
	    this.state.text,
	    this.state.shareUsers,
	    this.state.shareRoles
	);
	this.setState({
	    title: "",
	    text: "",
	    shareRoles: [],
	    shareUsers: []
	});
    }

});


module.exports = CaseNoteEditor;
