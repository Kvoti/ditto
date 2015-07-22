import React from 'react';
import { connect, Provider } from 'redux/react';
import { createRedux } from 'redux';

import CaseNotes from './CaseNotes.jsx';
import CaseNotesStore from './CaseNotesStore';
import CaseNoteActions from './CaseNoteActions';

const redux = createRedux(CaseNotesStore);

@connect(state => ({
    caseNotes: state && state.caseNotes
}))
class CaseNotesContainer extends React.Component {

    componentDidMount () {
	this.props.dispatch(CaseNoteActions.casenotes.list());
    }
    
    render () {
	const { caseNotes, dispatch } = this.props;
	return (
	    <CaseNotes
		    caseNotes={caseNotes}
		    dispatch={dispatch}
		    onSave={this._saveNote.bind(this)} />
	);
    }
    
    _saveNote (title, text, shareWithUsers, shareWithRoles) {
	// TODO maybe neater if action creator creates object?
	this.props.dispatch(CaseNoteActions.casenotes.create({
	    client: this.props.client,
	    title: title,
	    text: text,
	    shared_with_roles: shareWithRoles,
	    shared_with_users: shareWithUsers,
	}));
    }
}

// TODO this is boilerplatey
export default class App {
  render() {
    return (
      <Provider redux={redux} >
        {() =>
          <CaseNotesContainer {...this.props} />
        }
      </Provider>
    );
  }
}
