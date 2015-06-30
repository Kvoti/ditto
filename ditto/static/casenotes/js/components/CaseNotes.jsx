var React = require('react');
var DataGrid = require('react-datagrid');
var CaseNoteEditor = require('./CaseNoteEditor.jsx');

var CaseNotes = React.createClass({
    getInitialState () {
	return {};
    },
    
    componentDidMount () {
	// TODO fix hardcoded 'di' (and rest of url)
	$.get('/di/api/casenotes/')
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
		 {this.state.isAdding ? <CaseNoteEditor onCancel={this._cancelAdd} /> : null}
	    </div>
	);
    },

    _addNote () {
	this.setState({isAdding: true});
    },

    _cancelAdd () {
	this.setState({isAdding: false});
    },
});

module.exports = CaseNotes;
