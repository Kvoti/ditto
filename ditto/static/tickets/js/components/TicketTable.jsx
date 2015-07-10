var React = require('react/addons');
var FixedDataTable = require('fixed-data-table');
var utils = require('../../../configuration/js/utils');
var strftime = require('strftime');
import {get, post} from "../../../js/request";
import TicketViewer from './TicketViewer.jsx';

var update = React.addons.update;
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

var ticketsURL = '/' + DITTO.tenant + '/api/tickets/';

var TicketTable = React.createClass({

    getInitialState () {
	return {
	    dataList: [],
	    showingTicket: null,
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
	return (
	    <div>
		{this.state.showingTicket === null ?
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
		 />
		 <Column
		 label="RESOLVED?"
		 width={150}
		 dataKey="is_resolved"
		 />
		 </Table>
		 : null}
		 {this.state.showingTicket !== null ?
		  <div>
		  <TicketViewer ticket={this.state.dataList[this.state.showingTicket]} />
		  <button
		  className="btn btn-default"
		  onClick={this._closeCaseNote}
		  >
		  Close
		  </button>
		  {this._isResolvable(this.state.showingTicket) ?
		      <button
		      className="btn btn-success"
		      onClick={this._resolve.bind(this, this.state.showingTicket)}
		      >
		      Resolve
		      </button>
		      : null}
		  {this._isClaimable(this.state.showingTicket) ?
		      <button
		      className="btn btn-success"
		      onClick={this._claim.bind(this, this.state.showingTicket)}
		      >
		      Claim
		      </button>
		      : null}
		  </div>
		  : null}
	    </div>
	);
    },

    _isClaimable (index) {
	var ticket = this.state.dataList[index];
	return !ticket.assigned_to;
    },

    _isResolvable (index) {
	var ticket = this.state.dataList[index];
	return ticket.assigned_to === DITTO.user && !ticket.is_resolved;
    },
    
    _claim (index) {
	var ticket = this.state.dataList[index];
	var change = {};
	change[index] = {assigned_to: {$set: DITTO.user}};
	// as usual optimistically update the ui then fire off the ajax request
	this.setState({dataList: update(this.state.dataList, change)},
	    () => post(ticket.claim_url)
	);
    },
    
    _resolve (index) {
	var ticket = this.state.dataList[index];
	var change = {};
	change[index] = {is_resolved: {$set: true}};
	// as usual optimistically update the ui then fire off the ajax request
	this.setState({dataList: update(this.state.dataList, change)},
	    () => post(ticket.resolve_url)
	);
    },

    _showCaseNote (rowIndex) {
	this.setState({showingTicket: rowIndex});
    },

    _closeCaseNote () {
	this.setState({showingTicket: null});
    }
    
});

module.exports = TicketTable;
