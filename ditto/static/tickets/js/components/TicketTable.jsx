var React = require('react/addons');
var FixedDataTable = require('fixed-data-table');
var utils = require('../../../configuration/js/utils');
var strftime = require('strftime');
var BS = require('react-bootstrap');
import {get, post} from "../../../js/request";

var update = React.addons.update;
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

var ticketsURL = '/' + DITTO.tenant + '/api/tickets/';

var TicketTable = React.createClass({

    getInitialState () {
	return {
	    dataList: [],
	    showModal: false,
	}
    },

    componentDidMount () {
	get(ticketsURL)
	    .done(res => {
		this.setState({dataList: res});
	    });
	// TODO .fail(
    },

    _rowGetter(index) {
	return this.state.dataList[index];
    },

    _cellDataGetter(key, row) {
	// ticket api data is nested (not sure how/if can flatten)
	return row.case_note[key];
    },

    _renderAssignee (assignee, key, ticket, rowIndex) {
	if (assignee) {
	    return assignee;
	} else {
	    return (
		<button
			onClick={this._claim.bind(this, ticket, rowIndex)}
			className="btn btn-success"
			>Claim
		</button>
	    );
	}
    },
    
    _renderStatus (isResolved, key, ticket, rowIndex) {
	if (!ticket.assigned_to || isResolved) {
	    return String(isResolved);
	} else {
	    return (
		<button
			onClick={this._resolve.bind(this, ticket, rowIndex)}
			className="btn btn-success"
			>Resolve
		</button>
	    );
	}
    },

    _renderDate (ISODateString) {
	var date = utils.ISODateStringToDate(ISODateString);
	return strftime('%d/%m/%Y | %I:%M%p', date);
    },

    _renderTitle (title, key, ticket, rowIndex) {
	return (
	    <a onClick={this._showCaseNote.bind(this, rowIndex)}>{title}</a>
	);
    },
    
    render () {
	var showing = this.state.showModal !== false;
	var title, text;
	if (showing) {
	    title = this.state.dataList[this.state.showModal].case_note.title;
	    text = this.state.dataList[this.state.showModal].case_note.text;
	}
	return (
	    <div>
	    <BS.Modal show={showing} onHide={this._closeCaseNote}>
            <BS.ModalHeader closeButton>
            <BS.ModalTitle>{title}</BS.ModalTitle>
            </BS.ModalHeader>
            <BS.ModalBody>
		{text}
	    </BS.ModalBody>
	    </BS.Modal>
	    <Table
		    rowHeight={50}
		    rowGetter={this._rowGetter}
		    rowsCount={this.state.dataList.length}
	            width={900}
	            maxHeight={600}
		    headerHeight={50}>
		<Column
			label="CLIENT"
			width={150}
			dataKey="client"
			cellDataGetter={this._cellDataGetter}
			/>
		<Column
			label="PROFESSIONAL"
			width={150}
			dataKey="author"
			cellDataGetter={this._cellDataGetter}
			/>
		<Column
			label="TITLE"
			width={150}
			dataKey="title"
			cellDataGetter={this._cellDataGetter}
			cellRenderer={this._renderTitle}
			/>
		<Column
			label="CREATED AT"
			width={150}
	                dataKey="created_at"
	                cellRenderer={this._renderDate}
			/>
		<Column
			label="ASSIGNED TO"
			width={150}
			dataKey="assigned_to"
			cellRenderer={this._renderAssignee}
			/>
		<Column
			label="RESOLVED?"
			width={150}
			dataKey="is_resolved"
			cellRenderer={this._renderStatus}
			/>
	    </Table>
	    </div>
	);
    },

    _claim (ticket, index) {
	var change = {};
	change[index] = {assigned_to: {$set: DITTO.user}};
	// as usual optimistically update the ui then fire off the ajax request
	this.setState({dataList: update(this.state.dataList, change)},
	    () => post(ticket.claim_url)
	);
    },
    
    _resolve (ticket, index) {
	var change = {};
	change[index] = {is_resolved: {$set: true}};
	// as usual optimistically update the ui then fire off the ajax request
	this.setState({dataList: update(this.state.dataList, change)},
	    () => post(ticket.resolve_url)
	);
    },

    _showCaseNote (rowIndex) {
	this.setState({showModal: rowIndex});
    },

    _closeCaseNote () {
	this.setState({showModal: false});
    }
	
});

module.exports = TicketTable;
