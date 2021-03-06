var React = require('react/addons');
var update = React.addons.update;
var CheckList = require('./CheckList.jsx');
var RegularChatroomSchedule = require('./RegularChatroomSchedule.jsx');
var OneOffChatroomSchedule = require('./OneOffChatroomSchedule.jsx');
var RoleAndUserSelect = require('./RoleAndUserSelect.jsx');
var Accordion = require('react-bootstrap/lib/Accordion');
var Panel = require('react-bootstrap/lib/Panel');
var API = require('../utils/SettingsWebAPIUtils');
var RoomStore = require('../stores/RoomStore');
var Alert = require('react-bootstrap/lib/Alert');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var RouteActionCreators = require('../actions/RouteActionCreators');
var assign = require('object-assign');
var urls = require('../../../flux-chat/js/utils/urlUtils');

import { Router, Route, Link, Navigation } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

// Note was using slug package from npm but couldn't figure out
// how to not bundle the symbol files with webpack -- probably easy ...
function slugify(text) {
  return text
    .replace(/[^\w]/g, '-')
    .replace(/^\-+/, '')
    .replace(/\-+$/, '');
}

function getStateFromStores () {
    return {
	chatrooms: RoomStore.getAll(),
	currentRoomID: RoomStore.getCurrentID(),
    }
}

var ChatroomSettings = React.createClass({
    mixins: [React.addons.LinkedStateMixin, Navigation],
    
    getInitialState () {
	var initial = getStateFromStores();
	return assign({
	    newChatroomName: "",
	    newChatroomFormErrors: [],
	    currentRoomID: initial.currentRoomID,
	}, initial);
    },
    
    componentWillMount () {
        RouteActionCreators.changeChatroom(this.props.location.pathname);
    },

    componentDidMount () {
	// TODO api batching probably useful here
	API.loadChatrooms();
	API.loadSlots();
        RoomStore.addChangeListener(this._onChange);
    },
    
    componentWillReceiveProps (nextProps) {
        RouteActionCreators.changeChatroom(nextProps.location.pathname);
    },

    componentWillUnmount () {
        RoomStore.removeChangeListener(this._onChange);
    },
    
    _onChange () {
        this.setState(getStateFromStores());
    },
    
    render () {
	console.log('rendering settings for room', this.state.currentRoomID);
	return (
	    <div>
		{this.state.newChatroomFormErrors.map(e => <Alert bsStyle="danger">{e}</Alert>)}
	    <div className="form-inline">
		<div className="form-group">
		    <label>
			<input className="form-control" type="checkbox" checkedLink={this.linkState('isNewChatroomRegular')} />
			Regular scheduled room?
		    </label>
		</div>
		<div className="form-group">
		    <input className="form-control" type="text" valueLink={this.linkState('newChatroomName')} placeholder="Enter name" />
		</div>
		<div className="form-group">
		    <button className="btn btn-success" onClick={this._addChatroom}>Add chatroom</button>
		</div>
	    </div>
	    {this.state.chatrooms.length ? 
		<Accordion activeKey={this.state.currentRoomID} onSelect={this._changeRoom}>
		    {this.state.chatrooms.map(room => {
			return (
			    <Panel key={room.slug} eventKey={room.slug} header={room.name}>
				{room.is_regular ?
				 <RegularChatroomSchedule room={room.slug} /> :
				    <OneOffChatroomSchedule room={room.slug} />}
			    <p>
			    {!this.state.confirmDelete ? <button
			    className="btn btn-danger"
			    disabled={room.isDeleting}
			    onClick={this._confirmDeleteChatroom.bind(this, room.slug)}>
			    {room.isDeleting ? 'Deleting ...' : 'Delete room'}
			    </button> : null}
			    {this.state.confirmDelete === room.slug ?
				<span>Are you sure? <button
				className="btn btn-danger"
				onClick={this._deleteChatroom.bind(this, room.slug)}>
				Yes
				</button>
				<button
				className="btn btn-default"
				onClick={this._cancelDeleteChatroom.bind(this, room.slug)}>
				Cancel
				</button></span>
				: null}
			    </p>
			    </Panel>
			);
		    })}
		</Accordion>
	     : null }
	    </div>
	);
    },

    _changeRoom (slug) {
	this.transitionTo(urls.chatroomConfig(slug));
    },
    
    _addChatroom () {
	var errors = this._validateNewChatroom();
	if (errors.length) {
	    this.setState({newChatroomFormErrors: errors});
	} else {
	    SettingsActionCreators.createChatroom({
		is_regular: this.state.isNewChatroomRegular,
		slug: slugify(this.state.newChatroomName),
		name: this.state.newChatroomName,
		roles: [],
		users: []
	    })
	    this.setState({
		newChatroomName: "",
		newChatroomFormErrors: [],
		isNewChatroomRegular: false,
	    });
	}
    },

    _validateNewChatroom () {
      var errors = [];
      let newChatroomID = slugify(this.state.newChatroomName);
	if (this.state.chatrooms.findIndex(c => c.slug === newChatroomID) > -1) {
	    errors.push('Room with id ' + newChatroomID + ' already exists');
	}
	return errors;
    },

    _confirmDeleteChatroom (slug) {
	this.setState({confirmDelete: slug});
    },

    _cancelDeleteChatroom (slug) {
	this.setState({confirmDelete: null});
    },
    
    _deleteChatroom (slug) {
	SettingsActionCreators.deleteChatroom(slug);
	this.setState({confirmDelete: null});
    }
});

// declare our routes and their hierarchy
var routes = (
    <Router history={history} >
	<Route path={urls.chatroomConfig(':id')} component={ChatroomSettings} ignoreScrollBehavior/>
    </Router>
);

module.exports = routes;
