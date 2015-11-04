import React from 'react';
import UserProfileStore from '../../tidy/js/profile/stores/UserProfileStore';
import { updateUserBio } from '../../tidy/js/profile/utils/WebAPIUtils';
import Bio from './Bio';

function getStateFromStores() {
  return {
    profile: UserProfileStore.get(),
    status: UserProfileStore.getStatus()
      
  };
}

export default class BioContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = getStateFromStores();
  }
  
  componentDidMount() {
    UserProfileStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    UserProfileStore.removeChangeListener(this._onChange);
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
                 bio={this.state.profile === null ? 'Loading...' : this.state.profile.bio}
                 onSave={this._updateBio}
         />
      </div>
    );
  }

  _onChange = () => {
    this.setState(getStateFromStores());
  }

  _updateBio = (bio) => {
    updateUserBio(
      DITTO.other,
      {...this.state.profile, bio: bio}
    );
  }
}
