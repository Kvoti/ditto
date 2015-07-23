import React from 'react';
import { Table, Column } from 'fixed-data-table';
import TimeAgo from '../../../flux-chat/js/components/TimeAgo.react';

import CaseNoteViewer from './CaseNoteViewer.jsx';
import commonPropTypes from './commonPropTypes';

export default class CaseNotesViewer extends React.Component {
    static propTypes = {
	caseNotes: commonPropTypes.caseNotes
    }

    state = {
	showing: null,
    }
    
    _rowGetter = (index) => {
	return this.props.caseNotes[index];
    }

    _renderDateTime = (dateTime) => {
	return <TimeAgo when={dateTime} />;
    }

    _renderTitle = (title, key, user, rowIndex) => {
	return (
	    <a onClick={this._show.bind(this, rowIndex)}>{title}</a>
	);
    }
    
    render () {
	return (
	    <div>
		{this.state.showing !== null ?
		 <div>
		 <button onClick={this._unShow} className="btn btn-default">Back</button>
		 <CaseNoteViewer caseNote={this.props.caseNotes[this.state.showing]}/>
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

    _show (index) {
	this.setState({showing: index});
    }
    
    _unShow = () => {
	this.setState({showing: null});
    }
	
}
