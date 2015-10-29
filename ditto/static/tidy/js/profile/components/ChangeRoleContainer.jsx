import React, { PropTypes} from 'react';
import RoleStore from '../../../../configuration/js/stores/RoleStore';
import UserProfileStore from '../stores/UserProfileStore';
import ChangeRole from './ChangeRole';
import { getUserProfile, setUserProfile } from '../utils/WebAPIUtils';

getUserProfile(DITTO.other);

function getStateFromStores() {
  return {
    roles: RoleStore.getAll(),
    profile: UserProfileStore.get()
  };
}

export default class ChangeRoleContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = getStateFromStores();
  }

  componentDidMount() {
    RoleStore.addChangeListener(this._onChange);
    UserProfileStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    RoleStore.removeChangeListener(this._onChange);
    UserProfileStore.removeChangeListener(this._onChange);
  }

  render() {
    if (!(this.state.roles.length && this.state.profile)) {
      return <p>Loading...</p>;
    }
    return (
      <ChangeRole
              currentRole={this.state.profile.role}
              roles={this.state.roles}
              onChange={this._updateRole}
              />
    );
  }

  _onChange = () => {
    this.setState(getStateFromStores());
  }

  _updateRole = (e) => {
    setUserProfile(
      DITTO.other,
      {...this.state.profile, role: e.target.value}
    );
  }
}
