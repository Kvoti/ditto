import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import ValidatedControl from '../../../lib/form/ValidatedControl';
import ValidationStatus from '../../../lib/form/ValidationStatus';

export default class Choice extends React.Component {
  static propTypes = {
    // TODO share the prop types for the data with the viewer component
    isMultiple: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.string),
    hasOther: React.PropTypes.bool,
    otherText: React.PropTypes.string,
    ////////////////////////////////////////////////////////////////////////////////
    onChangeIsMultiple: PropTypes.func.isRequired,
    onAddOption: PropTypes.func.isRequired,
    onRemoveOption: PropTypes.func.isRequired,
    onChangeOption: PropTypes.func.isRequired,
    onChangeHasOther: PropTypes.func.isRequired,
    onChangeOtherText: PropTypes.func.isRequired,
    onChangeOptionValidation: PropTypes.func.isRequired
  }

  static defaultProps = {
    isMultiple: false,
    options: []
  }

  render() {
    return (
      <div>
        <div className="form-group">
          <label>
            Is multiple?
          </label>
          <input
                  className="form-control"
                  type="checkbox"
                  checked={this.props.isMultiple}
                  onChange={this.props.onChangeIsMultiple}
          />
        </div>
        <div>
          {this.props.options.map(this._renderOption)}
        </div>
	<p>
          <Button onClick={this.props.onAddOption}
                  bsStyle='success'
                  ariaLabel='Add option'
                  title='Add option'
                  >
            <Glyphicon glyph="plus" />
          </Button>
        </p>
        <div className="form-group">
          <label>
            Has other?
          </label>
          <input
                  className="form-control"
                  type="checkbox"
                  checked={this.props.hasOther}
                  onChange={this.props.onChangeHasOther}
          />
        </div>
        <div className="form-group">
          <label>
            Enter 'other' text:
          </label>
          <input
                  className="form-control"
                  disabled={!this.props.hasOther}
                  type="text"
                  value={this.props.otherText}
                  onChange={this.props.onChangeOtherText}
          />
        </div>
      </div>
    );
  }

  // TODO use TextItem here
  _renderOption = (option, index) => {
    return (
      <div className="form-group">
        <div className="input-group">
          <ValidationStatus
                  label="Option"
                  errors={this.props.errors[index]}
                  >
            <ValidatedControl
                    validate={this._updateOptionValidation.bind(this, index)}
                    immediate={this.props.errors[index] !== null}
                    >
              <input
                      className="form-control"
                      type='text'
                      onChange={this._updateOption.bind(this, index)}
                      value={option}
              />
            </ValidatedControl>
          </ValidationStatus>
          <span className="input-group-btn">
            <Button onClick={this._removeOption.bind(index)}
                    ref={'option' + index}
                    bsStyle='danger'
                    ariaLabel='Remove option'
                    title='Remove option'
                    >
              <Glyphicon glyph="remove" />
            </Button>
          </span>
        </div>
      </div>
    );
  }

  _updateOption(index, e) {
    this.props.onChangeOption(index, e);
  }

  _removeOption = (index) => {
    this.props.onRemoveOption(index);
  }

  _updateOptionValidation(index) {
    this.props.onChangeOptionValidation(index);
  }
}
