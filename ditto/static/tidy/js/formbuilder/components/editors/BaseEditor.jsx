import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

// Common base class for all form builder edit components
export default class BaseEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: this._copyProps(),
      isCancelling: false
    };
  }

  _copyProps() {
    return _.cloneDeep(this.props);
  }

  _isChanged() {
    return !_.isEqual(this.props, this.state.config);
  }

  _revertChanges() {
    this.setState({config: this._copyProps()});
  }

  _cancelOrConfirm = () => {
    if (this._isChanged()) {
      let change = {isCancelling: {$set: true}};
      this.setState(
        React.addons.update(this.state, change)
      );
    } else {
      this._cancel();
    }
  }

  _cancel = () => {
    this.props.onCancel();
    this._cancelCancel();
  }

  _cancelCancel = () => {
    let change = {isCancelling: {$set: false}};
    this.setState(
      React.addons.update(this.state, change)
    );
  }

  _update(field, e) {
    let value = e.target.value;
    let change = {config: {[field]: {$set: value}}};
    let newState = React.addons.update(this.state, change);
    this.setState(newState);
  }

}
