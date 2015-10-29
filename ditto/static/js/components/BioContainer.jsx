import React from 'react';

import Bio from './Bio';
import {get, put} from '../request';

// TODO connecting data container to endpoint is boiler-plate
// (wrote redux-rest to handle this!)
export default class BioContainer extends React.Component {
  state = {
    bio: null,
    status: null
  }

  componentDidMount() {
    get(
      // TODO fix hardcoded url
      `/di/api/users/${DITTO.other}/`)
      .done(res => {
        console.log('got bio', res);
	this.setState({bio: res});
      });
    // TODO .fail(
  }

  render() {
    let status = this.state.status;
    let msgType;
    let msg;
    if (status === 'saving') {
      msgType = 'info';
      msg = 'Saving...';
    } else if (status === 'failed') {
      msgType = 'danger';
      msg = 'An error occurred while saving, please try again';
    } else if (status === 'saved') {
      msgType = 'success';
      msg = 'Changes saved';
    }
    return (
      <div>
        {status !== null ?
         <p className={'bg-' + msgType}>{msg}</p> :
         null
         }
         <Bio
                 bio={this.state.bio === null ? 'Loading...' : this.state.bio.bio}
                 onSave={this._save}
         />
      </div>
    );
  }

  _save = (newBio) => {
    let bio = this.state.bio;
    bio.bio = newBio;
    this.setState(
      {
        bio: bio,
        status: 'saving'
      },
      // TODO *never* sure order of setting state and making API call
      () => {
        put(`/di/api/users/${DITTO.other}/`, bio)
          .done(() => {
            this.setState({status: 'saved'});
          })
          .fail(() => {
            this.setState({status: 'failed'});
          });
      }
    );
  }
}
