var React = require('react');
var DataGrid = require('react-datagrid');
var CaseNoteEditor = require('./CaseNoteEditor.jsx');

var caseNotesURL = '/' + DITTO.tenant + '/api/casenotes/';

var CaseNotes = React.createClass({
    propTypes: {
	client: React.PropTypes.string.isRequired
    },
    
    getInitialState () {
	return {};
    },
    
    componentDidMount () {
	$.get(caseNotesURL + '?client__username=' + this.props.client )
	    .done(res => {
		this.setState({caseNotes: res});
	    });
	// TODO .fail(
    },

    columns: [
	{name: 'author'},
	{name: 'client'},
	{name: 'created_at'},
	{name: 'text'},
    ],
    
    render () {
	if (!this.state.caseNotes) {
	    return <p>Loading...</p>;
	}
	return (
	    <div>
		<DataGrid idProperty="caseNotesGrid" dataSource={this.state.caseNotes} columns={this.columns}/>
		{!this.state.isAdding ?
		 <button onClick={this._addNote}>Add case note</button> : null}
		 {this.state.isAdding ?
		  <CaseNoteEditor
		  onSave={this._saveNote}
		  onCancel={this._cancelAdd} /> : null}
	    </div>
	);
    },

    _addNote () {
	this.setState({isAdding: true});
    },

    _cancelAdd () {
	this.setState({isAdding: false});
    },

    _saveNote (text, shareWithUsers, shareWithRoles) {
	var pendingIndex;
	var caseNotes = this.state.caseNotes;
	caseNotes.push({
	    author: DITTO.user,
	    created_at: new Date(),  // TODO set this on save?
	    text: text
	});
	pendingIndex = caseNotes.length - 1;
	this.setState({caseNotes: caseNotes}, () => {
            $.ajax({
		// TODO fix hardcoded url
		url: caseNotesURL,
		type: "POST",
		data: JSON.stringify({
		    client: this.props.client,
		    text: text,
		    shared_with_roles: shareWithRoles,
		    shared_with_users: shareWithUsers,
		}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
            }).done(() => this.setState({isAdding: false}))
		.fail(() => {
		    alert('there was a problem saving the case note');
		    var caseNotes = this.state.caseNotes;
		    caseNotes.splice(pendingIndex, 1);
		    this.setState({caseNotes: caseNotes});
		});
	});
    }
    
});

module.exports = CaseNotes;
