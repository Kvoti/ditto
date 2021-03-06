var React = require('react/addons');
var FixedDataTable = require('fixed-data-table');
var utils = require('../../../configuration/js/utils');
var strftime = require('strftime');
var urls = require('../../../flux-chat/js/utils/urlUtils');

import { Router, Route, Link } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

import {get, post} from "../../../js/request";
import TicketViewer from './TicketViewer.jsx';

var update = React.addons.update;
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

var TicketTable = React.createClass({

    getInitialState () {
	return {
	    dataList: [],
	}
    },

    componentDidMount () {
	get(urls.api.tickets())
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
	    <div><Link to={urls.ticket(ticket.id)}>{title}</Link></div>
	);
    },

  _renderResolved (isResolved) {
    let yesno = isResolved ? 'YES' : 'NO';
    return <div>{yesno}</div>;
  },
    
    render () {
      var showingTicket;
      let index;
	if (this.props.params.id !== undefined) {
	    index = this.state.dataList.findIndex(
	      t => t.id == this.props.params.id);
          showingTicket = this.state.dataList[index];
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
                 cellRenderer={this._renderResolved}
		 />
		 </Table>
		 : null}
		 {showingTicket ?
		  <div>
		  <Link
		  className="btn btn-default"
		  to={urls.tickets()}
		  >
		  Back
		  </Link>
		  <TicketViewer ticket={showingTicket} />
		  {this._isResolvable(showingTicket) ?
		      <button
		      className="btn btn-success"
		      onClick={this._resolve.bind(this, index)}
		      >
		      Resolve
		      </button>
		      : null}
		  {this._isClaimable(showingTicket) ?
		      <button
		      className="btn btn-success"
		      onClick={this._claim.bind(this, index)}
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
      // Remove resolved ticket from the list
      var change = {$splice: [[index, 1]]};
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
	<Route path={urls.tickets()} component={TicketTable}/>
	<Route path={urls.ticket(":id")} component={TicketTable}/>
    </Router>
);

module.exports = router;
