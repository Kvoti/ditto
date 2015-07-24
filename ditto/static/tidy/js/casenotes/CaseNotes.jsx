import React from 'react';
import { Alert, TabbedArea, TabPane } from 'react-bootstrap/lib';

import itemStatus from '../lib/itemStatus';
import commonPropTypes from './commonPropTypes';
import CaseNotesViewer from './CaseNotesViewer.jsx';
import CaseNoteEditor from './CaseNoteEditor.jsx';

export default class CaseNotes extends React.Component {
    static propTypes = {
	showNote: React.PropTypes.number,
	caseNotes: commonPropTypes.caseNotes,
	onSave: React.PropTypes.func.isRequired,
    }

    static defaultProps = {
	caseNotes: []
    }
    
    render () {
	return (
	    <TabbedArea defaultActiveKey={2} bsStyle="tabs">
		<TabPane tab="New note" eventKey={1}>
		    {this.props.caseNotes.map(note => {
			console.log(note.title, note.status);
			if (note.status === itemStatus.pending) {
			    return <Alert key={note.id} bsStyle="warning">Saving note '{note.title}'...</Alert>;
			} else if (note.status === itemStatus.saved) {
			    return <Alert key={note.id} bsStyle="success">Saved note '{note.title}'</Alert>;
			} else if (note.status === itemStatus.failed) {
			    // TODO what to do in case of error?
			    return <Alert key={note.id} bsStyle="danger">Error saving note '{note.title}'</Alert>;
			}
		     })}
		    <CaseNoteEditor
			    onSave={this.props.onSave}
			    />
		</TabPane>
		<TabPane tab="View case history" eventKey={2}>
		    {!this.props.caseNotes ? "Loading..." :
		     <CaseNotesViewer caseNotes={this.props.caseNotes} showNote={this.props.showNote}/>
		     }
		     <input type="search" placeholder="Search" />
		</TabPane>
	    </TabbedArea>
	);
    }
}
