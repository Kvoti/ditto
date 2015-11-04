import React, { PropTypes} from 'react';

export default class ChangeRole extends React.Component {
  static propTypes = {
    currentRole: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired
  }

  render() {
    return (
      <div>
        <p>Change role</p>
        <select
                className="form-control"
                onChange={this.props.onChange}
                value={this.props.currentRole}
                >
          {this.props.roles.map(role => {
            return (
              <option
              key={role}
              value={role}
              >{role}
              </option>
            );
           })}
        </select>
      </div>
    );
  }
}
