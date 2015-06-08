var React = require('react/addons');
var update = React.addons.update;
var Accordion = require('react-bootstrap/lib/Accordion');


var CheckList = React.createClass({
    getInitialState () {
	return {
	    items: this.props.items,
	    selected: [] || this.props.selected
	};
    },
    
    render () {
	return (
	    <div>
		{this.props.items.map(r => {
		    return (
			<p key={r}>
			    <label>
				<input
					onChange={this._toggleItem.bind(this, r)}
					checked={this.state.selected.indexOf(r) !== -1}
					type="checkbox" /> {r}
			    </label>
			</p>
		    );
		 })}
	    </div>
	);
    },
    
    _toggleItem (item) {
	var i = this.state.selected.indexOf(item);
	var change;
	if (i === -1) {
	    change = update(this.state, {selected: {$push: [item]}});
	} else {
	    change = update(this.state, {selected: {$splice: [[i, 1]]}});
	}
	this.setState(
	    change,
	    () => this.props.onChange(this.state.selected)
	);
    }
    
});

module.exports = CheckList;
