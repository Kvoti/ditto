import React from 'react';
import TimeAgo from '../../../flux-chat/js/components/TimeAgo.react';
import CommentsContainer from '../comments/CommentsContainer.jsx';

export default class CaseNoteViewer extends React.Component {
    //static propTypes = {
    //	caseNote: 
    //   }

    render () {
	return (
	    <div>
		<dl>
		    <dt>Author:</dt>
		    <dd>{ this.props.caseNote.author }</dd>
		    <dt>On:</dt>
		    <dd>{ this.props.caseNote.created_at }</dd>
		    <dt>Title:</dt>
		    <dd>{ this.props.caseNote.title }</dd>
		    <dt>Note:</dt>
		    <dd>{ this.props.caseNote.text }</dd>
		</dl>
		<h3>Comments</h3>
		<CommentsContainer contentType="casenote" objectID={this.props.caseNote.id} />
	    </div>
	    
	);
    }
}
