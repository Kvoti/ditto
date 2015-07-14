var React = require('react/addons');
var FixedDataTable = require('fixed-data-table');
var utils = require('../../../configuration/js/utils');
var strftime = require('strftime');
import { Router, Route, Link } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

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
	    <Link to={'/di/dashboard/tickets/' + ticket.id + '/'}>{title}</Link>
	);
    },
    
    render () {
	var showingTicket;
	if (this.props.params.id !== undefined) {
	    showingTicket = this.state.dataList.find(
		t => t.id == this.props.params.id);
	}
	return (
	    <div>
		{!showingTicket ?
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
		 {showingTicket ?
		  <div>
		  <TicketViewer ticket={showingTicket} />
		  <Link
		  className="btn btn-default"
		  to='/di/dashboard/tickets/'
		  >
		  Close
		  </Link>
		  {this._isResolvable(showingTicket) ?
		      <button
		      className="btn btn-success"
		      onClick={this._resolve.bind(this, showingTicket)}
		      >
		      Resolve
		      </button>
		      : null}
		  {this._isClaimable(showingTicket) ?
		      <button
		      className="btn btn-success"
		      onClick={this._claim.bind(this, showingTicket)}
		      >
		      Claim
		      </button>
		      : null}
		  </div>
		  : null}
	    </div>
	);
    },

    _isClaimable (ticket) {
	return !ticket.assigned_to;
    },

    _isResolvable (ticket) {
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

});

// declare our routes and their hierarchy
// TODO would like to split out the table and the viewer
// but not quite sure how as the claim/resolve buttons belong
// to the table (as the viewer is just that, a viewer)
// TODO can I use relative paths here?
var router = (
    <Router history={history} >
	<Route path="/di/dashboard/tickets/" component={TicketTable}/>
	<Route path="/di/dashboard/tickets/:id/" component={TicketTable}/>
    </Router>
);

module.exports = router;
