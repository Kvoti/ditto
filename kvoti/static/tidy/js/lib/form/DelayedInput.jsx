import React, { PropTypes } from 'react';

export default class DelayedInput extends React.Component {
  static propTypes = {
    immediate: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onPendingChange: PropTypes.func.isRequired,
    typingDelay: PropTypes.number
  }

  static defaultProps = {
    typingDelay: 300  // ms
  }

  render() {
    let { typingDelay, immediate, onChange, onPendingChange, ...props } = this.props;
    // TODO how best to share logic to wrap other controls, eg textarea, select, etc?
    return (
      <input
              {...props}
              onChange={this._onChange}
              onBlur={this._onBlur}
      />
    );
  }

  _onChange = (e) => {
    let value = this._getValue(e);
    // TODO I'd like to pass the event to the parent here but couldn't get that to work
    // (all event props were null)
    if (this.props.immediate) {
      this.props.onChange(value);
    } else {
      this.props.onPendingChange(value);
      this._pendChange(value);
    }
  }

  _onBlur = (e) => {
    if (this._pendingChange) {
      clearTimeout(this._pendingChange);
      this.props.onChange(this._getValue(e));
    }
  }

  _pendChange = (e) => {
    if (this._pendingChange) {
      clearTimeout(this._pendingChange);
    }
    this._pendingChange = setTimeout(() => {
      this.props.onChange(e);
    },
      this.props.typingDelay
    );
  }

  _getValue(e) {
    if (this.props.type === 'checkbox' || this.props.type === 'radio') {
      return e.target.checked;
    }
    return e.target.value;
  }
}
