import React from 'react';
import DataGrid from 'react-datagrid';

import commonPropTypes from './commonPropTypes';

export default class CaseNotesViewer extends React.Component {
    static propTypes = {
	caseNotes: commonPropTypes.caseNotes
    }

    render () {
	return (
	    <DataGrid
		    idProperty="caseNotesTable"
		    dataSource={this.props.caseNotes}
		    columns={[
			     {name: 'author'},
			     {name: 'created_at'},
			     {name: 'title'},
			     {name: 'status'},
			     ]}
		    />
	);
    }
    
}
