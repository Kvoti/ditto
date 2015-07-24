import React from 'react';
import { Table, Column } from 'fixed-data-table';
import { Link } from 'react-router';
import TimeAgo from '../../../flux-chat/js/components/TimeAgo.react';
import url from 'url';

import CaseNoteViewer from './CaseNoteViewer.jsx';
import commonPropTypes from './commonPropTypes';

export default class CaseNotesViewer extends React.Component {
    static propTypes = {
	caseNotes: commonPropTypes.caseNotes.isRequired,
	showNote: React.PropTypes.number,
    }

    _rowGetter = (index) => {
	return this.props.caseNotes[index];
    }

    _renderDateTime = (dateTime) => {
	return <TimeAgo when={dateTime} />;
    }

    _renderTitle = (title, key, caseNote, rowIndex) => {
	return (
	    <Link to={_absPath(`../${caseNote.client}/${caseNote.id}/`)}>{title}</Link>
	);
    }
    
    render () {
	let showing;
	if (this.props.showNote !== undefined) {
	    showing = this.props.caseNotes.find(
		c => c.id == this.props.showNote);
	}
	return (
	    <div>
		{showing ?
		 <div>
		 <Link to={_absPath('../')} className="btn btn-default">Back</Link>
		 <CaseNoteViewer caseNote={showing} />
		 </div>
		:
		<Table
		    rowHeight={50}
		    rowGetter={this._rowGetter}
		    rowsCount={this.props.caseNotes.length}
		    width={600}
		    maxHeight={600}
		    headerHeight={50}>
		<Column
			label="AUTHOR"
			width={150}
			dataKey="author"
			/>
		<Column
			label="CREATED"
			width={150}
			dataKey="created_at"
			cellRenderer={this._renderDateTime}
			/>
		<Column
			label="TITLE"
			width={150}
			dataKey="title"
			cellRenderer={this._renderTitle}
			/>
		<Column
			label="STATUS"
			width={150}
			dataKey="status"
			/>
		</Table>
	     }
	    </div>
	);
    }

}

// TODO this seems hacky. Better way to have relative urls work with react-router?
function _absPath(relativePath) {
    let pathname = url.parse(window.location.href).pathname;
    return url.resolve(pathname, relativePath);
}
