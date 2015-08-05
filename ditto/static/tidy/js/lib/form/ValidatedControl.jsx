import React, { PropTypes } from 'react';

export default class Validate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wasBlurred: false,
      wasValidated: this.props.immediate  // hack!?
    };
  }
      
  static propTypes = {
    typingDelay: PropTypes.number,
    immediate: PropTypes.bool
  }
  
  static defaultProps = {
    typingDelay: 1000  // ms
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
    // Only validate immediately if *re-editing* a previously validated value
    this.props.children.props.onChange && this.props.children.props.onChange(e);
    if (this.state.wasBlurred || this.state.wasValidated || this.props.immediate) {
      console.log('immediately validate');
      this.props.validate();
    } else {
      console.log('pend validation');
      this._pendValidation();
    }
  }

  _onBlur() {
    this.setState({
      wasBlurred: true
    }, this.props.validate);
  }

  _pendValidation = () => {
    if (this._pendingValidaton) {
      clearTimeout(this._pendingValidaton);
    }
    this._pendingValidaton = setTimeout(() => {
      this.props.validate();
      this.setState({wasValidated: true});
      },
      this.props.typingDelay
    );
  }
}
