import React from 'react';
import { connect, Provider } from 'redux/react';
import { createRedux } from 'redux';

import CaseNotes from './CaseNotes.jsx';
import API from '../API';

const redux = createRedux(API.reducers);

@connect(state => ({
    caseNotes: state && state.casenotes
}))
class CaseNotesContainer extends React.Component {

    componentDidMount () {
	this.props.dispatch(API.actions.casenotes.list());
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
	this.props.dispatch(API.actions.casenotes.create({
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
