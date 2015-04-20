var React = require('react/addons');
var update = React.addons.update;

var Undo = React.createClass({

    getInitialState: function () {
	return {
	    states: [this.props.state],
	    currentState: 0
	}
    },
    
    componentWillReceiveProps: function (newProps) {
	if (newProps.state !== this.state.states[this.state.currentState]) {
	    var numItemsToRemove = this.state.states.length - this.state.currentState + 1;
	    this.setState(
		update(this.state, {
		    states: {$splice: [  [this.state.currentState +1, numItemsToRemove, newProps.state]  ]},
		    currentState: {$set: this.state.currentState + 1}
		})
	    );
	}
    },
    
    render: function () {
	var canUndo, canRedo
	canUndo = this.state.currentState > 0;
	canRedo = this.state.currentState < this.state.states.length - 1;
	return (
	    <div>
		<button onClick={this._undo} disabled={!canUndo}>Undo</button>
		<button onClick={this._redo} disabled={!canRedo}>Redo</button>
		{this.props.children}
	    </div>
	);
    },

    _undo: function () {
	var prevState = this.state.states[this.state.currentState - 1];
	this.setState(
	    update(this.state, {currentState: {$set: this.state.currentState - 1}}),
	    function () { this.props.onUndo(prevState) }
	);
    },

    _redo: function () {
	var nextState = this.state.states[this.state.currentState + 1];
	this.setState(
	    update(this.state, {currentState: {$set: this.state.currentState + 1}}),
	    function () { this.props.onRedo(nextState) }
	);
    },
    
});

module.exports = Undo;
