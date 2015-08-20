import React, { PropTypes } from 'react';

export default class ControlErrors extends React.Component {
  static propTypes = {
    errors: PropTypes.oneOfType([
      null,
      PropTypes.arrayOf(PropTypes.string)
    ])
  }

  render() {
    let errors = this.props.errors;
    return errors && (
      <div>
	{errors.map((e) => <p key={e} className="help-block">{e}</p>)}
      </div>
    );
  }
}
