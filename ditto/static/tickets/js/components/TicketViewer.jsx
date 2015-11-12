var React = require('react/addons');

export default class TicketViewer extends React.Component {

    static propTypes = {
	ticket: React.PropTypes.object.isRequired
    }
    
    render () {
	var ticket = this.props.ticket;
	return (
	    <div>
		<h3>{ticket.case_note.title}</h3>
		{ticket.assigned_to ? <p><strong>Assigned to</strong> {ticket.assigned_to}</p> : null}
		{ticket.assigned_to ? <p><strong>Resolved?</strong> {ticket.is_resolved ? 'YES' : 'NO'}</p> : null}
		<p>{ticket.case_note.text}</p>
	    </div>
	);
    }
}
