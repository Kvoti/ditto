import React, { PropTypes} from 'react';
import RoleStore from '../../../../configuration/js/stores/RoleStore';
import ChangeRole from './ChangeRole';

function getStateFromStores() {
  return {
    roles: RoleStore.getAll()
  };
}

export default class ChangeRoleContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = getStateFromStores();
  }

  componentDidMount() {
    RoleStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    RoleStore.removeChangeListener(this._onChange);
  }

  render() {
    if (!this.state.roles.length) {
      return <p>Loading...</p>;
    }
    return (
      <ChangeRole
              currentRole=""
              roles={this.state.roles}
              onChange={e => alert(e)}
              />
    );
  }

  _onChange = () => {
    this.setState(getStateFromStores());
  }
}
