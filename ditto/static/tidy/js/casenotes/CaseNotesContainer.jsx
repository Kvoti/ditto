import React from 'react';
import { connect, Provider } from 'redux/react';
import { createRedux } from 'redux';
import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

import CaseNotes from './CaseNotes.jsx';
import flux from '../flux';

const redux = createRedux(flux.reducers);

@connect(state => ({
    caseNotes: state.casenotes_items
}))
class CaseNotesContainer extends React.Component {

    componentDidMount () {
	this.props.dispatch(flux.actionCreators.casenotes.list(
	    {client__username: this.props.params.client}
	));
    }
    
    render () {
	const { caseNotes, dispatch } = this.props;
	return (
	    <CaseNotes
		    caseNotes={caseNotes}
		    showNote={parseInt(this.props.params.id, 10)}
		    dispatch={dispatch}
		    onSave={this._saveNote.bind(this)} />
	);
    }
    
    _saveNote (title, text, shareWithUsers, shareWithRoles) {
	this.props.dispatch(flux.actionCreators.casenotes.create({
	    client: this.props.params.client,
	    title: title,
	    text: text,
	    shared_with_roles: shareWithRoles,
	    shared_with_users: shareWithUsers,
	}));
    }
}

// TODO this is boilerplatey

// declare our routes and their hierarchy
// TODO can I use relative paths here?
// TODO can I split out the table and viewer component?
function renderRoutes () {
    return (
	<Router history={history}>
	    <Route path="/di/users/" ignoreScrollBehavior={true}>
		<Route path=":client/" component={CaseNotesContainer} ignoreScrollBehavior={true}/>
		<Route path=":client/:id/" component={CaseNotesContainer} ignoreScrollBehavior={true}/>
	    </Route>
	</Router>
    );
}

class App extends React.Component {
  render() {
    return (
      <Provider redux={redux} >
        {renderRoutes}
      </Provider>
    );
  }
}

export default App;
