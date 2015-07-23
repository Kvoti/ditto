import React from 'react';
import { Table, Column } from 'fixed-data-table';
import TimeAgo from '../../../flux-chat/js/components/TimeAgo.react';

import commonPropTypes from './commonPropTypes';

export default class CaseNotesViewer extends React.Component {
    static propTypes = {
	caseNotes: commonPropTypes.caseNotes
    }

    _rowGetter = (index) => {
	return this.props.caseNotes[index];
    }

    _renderDateTime = (dateTime) => {
	return <TimeAgo when={dateTime} />;
    }
    
    render () {
	return (
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
			/>
		<Column
			label="STATUS"
			width={150}
			dataKey="status"
			/>
	    </Table>
	);
    }

}
