import React, { PropTypes } from 'react';

export default class Bio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      currentValue: this.props.bio
    };
  }

  static propTypes = {
    bio: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired
  }

  render() {
    if (this.state.isEditing) {
      return (
        <div>
        <div className="form-group">
          <textarea
                  className="form-control"
                  ref="bio"
                  value={this.state.currentValue}
                  onChange={e => this.setState({currentValue: e.target.value})}
          />
        </div>
        <div className="form-group">
          <button type="button" className="btn btn-default"
                  onClick={this._cancelEdit}
                  >
            Cancel
          </button>{' '}
          <button type="button" className="btn btn-success"
                  onClick={this._save}
                  disabled={!this.state.currentValue || this.state.currentValue === this.props.bio}
                  >
            Save
          </button>
        </div>
        </div>
      );
    }
    return (
      <div>
        <button type="button" className="btn btn-default btn-xs" aria-label="Edit"
                onClick={this._edit}
                >
          <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
        </button>
        <p>{this.state.currentValue}</p>
      </div>
    );
  }

  _edit = () => {
    this.setState(
      {isEditing: true},
      () => React.findDOMNode(this.refs.bio).focus()
    );
  }

  _cancelEdit = () => {
    this.setState({
      isEditing: false,
      currentValue: this.props.bio
    });
  }

  _save = () => {
    this.setState({
      isEditing: false
    });
    this.props.onSave(this.state.currentValue);
  }
}
