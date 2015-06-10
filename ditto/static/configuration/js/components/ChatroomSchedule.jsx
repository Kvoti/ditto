var React = require('react/addons');
var update = React.addons.update;
var RegularChatroomSchedule = require('./RegularChatroomSchedule.jsx');
var Constants = require('../constants/SettingsConstants');
var utils = require('../utils');
var assign = require('object-assign');

var ChatroomSchedule = React.createClass({
    getInitialState () {
	return {
	    type: null,
	}
    },
    
    render () {
	return (
	    <div>
		<p>Choose room type</p>
		<p>
		    <label>
			<input type="radio" checked={this.state.type === 'regular'} onChange={this._setType.bind(this, 'regular')}/> Regular
		    </label>
		    <label>
			<input type="radio" checked={this.state.type === 'oneoff'} onChange={this._setType.bind(this, 'oneoff')}/> One off
		    </label>
		</p>
		{this.state.type === 'regular' ? <RegularChatroomSchedule /> : null}
		{this.state.type === 'oneoff' ? <p>TODO one of schedule</p> : null}
	    </div>
	);
    },

    _setType (type) {
	this.setState({type: type});
    },
    
});

module.exports = ChatroomSchedule;
