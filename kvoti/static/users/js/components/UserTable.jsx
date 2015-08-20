var React = require('react/addons');
var FixedDataTable = require('fixed-data-table');
var utils = require('../../../configuration/js/utils');
var urls = require('../../../flux-chat/js/utils/urlUtils');
import { Router, Route, Link } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

import {get, post} from "../../../js/request";
//import UserViewer from './UserViewer.jsx';

// placeholder for now
class UserViewer extends React.Component {
    render () {
	return <p>ta da!</p>;
    }
}

var update = React.addons.update;
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

var UserTable = React.createClass({

    getInitialState () {
	return {
	    dataList: [],
	}
    },

    componentDidMount () {
	get(urls.api.users())
	    .done(res => {
		if (this.isMounted()) {
		    this.setState({dataList: res});
		}
	    });
	// TODO .fail(
    },

    _rowGetter(index) {
	return this.state.dataList[index];
    },

    _renderUsername (username, key, user, rowIndex) {
	// TODO need to escape username for use in url?
	return (
	    <Link to={urls.user(username)}>{username}</Link>
	);
    },
    
    render () {
	var showingUser;
	if (this.props.params.username !== undefined) {
	    showingUser = this.state.dataList.find(
		t => t.username == this.props.params.username);
	}
	return (
	    <div>
		{!showingUser ?
		 <Table
		 rowHeight={50}
		 rowGetter={this._rowGetter}
		 rowsCount={this.state.dataList.length}
		 width={750}
		 maxHeight={600}
		 headerHeight={50}>
		 <Column
		 label="USER NAME"
		 width={150}
		 dataKey="username"
		 cellRenderer={this._renderUsername}
		 />
		 <Column
		 label="FIRST NAME"
		 width={150}
		 dataKey="first_name"
		 />
		 <Column
		 label="LAST NAME"
		 width={150}
		 dataKey="last_name"
		 />
		 <Column
		 label="EMAIL"
		 width={150}
		 dataKey="email"
		 />
		 <Column
		 label="ROLE"
		 width={150}
		 dataKey="role"
		 />
		 </Table>
		 : null}
		 {showingUser ?
		  <div>
		  <UserViewer user={showingUser} />
		  <Link
		  className="btn btn-default"
		  to={urls.users()}
		  >
		  Close
	    </Link>
	    </div> : null }
	    </div>
	);
    },
});

// declare our routes and their hierarchy
// TODO can I use relative paths here?
// TODO can I split out the table and viewer component?
var router = (
    <Router history={history} >
	<Route path={urls.users()} component={UserTable}/>
	<Route path={urls.user(":username")} component={UserTable}/>
	{/* TODO <Route path={urls.user(":username")} component={UserViewer}/> ? */}
    </Router>
);

module.exports = router;
