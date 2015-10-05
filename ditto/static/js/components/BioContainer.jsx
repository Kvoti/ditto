import React from 'react';

import Bio from './Bio';

// TODO connecting data container to endpoint is boiler-plate
// (wrote redux-rest to handle this!)
export default class BioContainer extends React.Component {
  state = {
    bio: 'test'
  }
  
  render() {
    return (
      <Bio
              bio={this.state.bio}
              onSave={this._save}
      />
    );
  }

  _save = (newBio) => {
    this.setState({bio: newBio});
  }
}
