var React = require('react');
var DataGrid = require('react-datagrid');
var CaseNoteEditor = require('./CaseNoteEditor.jsx');
var BS = require('react-bootstrap/lib');

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
	{name: 'created_at'},
	{name: 'text'},
    ],
    
    render () {
	return (
	    <BS.TabbedArea defaultActiveKey={1} bsStyle="tabs">
		<BS.TabPane tab="New note" eventKey={1}>
		    {this.state.saving ? "saving..." : null}
	    {this.state.saved ?
		<BS.Alert bsStyle="success">{"Saved " + this.state.saved.text}</BS.Alert>
		: null
	    }
	    {!this.state.saving ?
		<CaseNoteEditor
			    onSave={this._saveNote}
			    /> : null }
		</BS.TabPane>
		<BS.TabPane tab="View case history" eventKey={2}>
		    {!this.state.caseNotes ? "Loading..." :
		     <DataGrid idProperty="caseNotesGrid" dataSource={this.state.caseNotes} columns={this.columns}/>
		    }
		     <input type="search" placeholder="Search" />
		</BS.TabPane>
	    </BS.TabbedArea>
	);
    },

    _saveNote (text, shareWithUsers, shareWithRoles) {
	var pendingIndex;
	var caseNotes = this.state.caseNotes;
	var caseNote = {
	    author: DITTO.user,
	    created_at: new Date(),  // TODO set this on save?
	    text: text
	}
	caseNotes.push(caseNote);
	pendingIndex = caseNotes.length - 1;
	this.setState({caseNotes: caseNotes, saving: caseNote}, () => {
            $.ajax({
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
            }).done(() => this.setState({saving: null, saved: this.state.saving}))
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
