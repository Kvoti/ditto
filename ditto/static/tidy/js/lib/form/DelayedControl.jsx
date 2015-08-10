import React, { PropTypes } from 'react';

export default class DelayedControl extends React.Component {
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
    let { typingDelay, immediate, children, ...props } = this.props;
    props.onChange = this._onChange.bind(this);
    props.onBlur = this._onBlur.bind(this);
    return React.cloneElement(
      this.props.children,
      props
    );
  }

  _onChange(e) {
    let value = e.target.value;
    if (this.props.immediate) {
      this.props.onChange(value);
    } else {
      this.props.onPendingChange(value);
      this._pendChange(value);
    }
  }

  _onBlur(e) {
    if (this._pendingChange) {
      clearTimeout(this._pendingChange);
    }
    this.props.onChange(e.target.value);
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
}
