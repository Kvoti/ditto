import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import Validate from '../../../lib/form/Validate';

export default class ScoreGroup extends React.Component {

  // TODO share these with the viewer component
  static propTypes = {
    labels: PropTypes.arrayOf(PropTypes.string),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        // TODO validate score labels and values are same length
        scores: PropTypes.arrayOf(PropTypes.number).isRequired
      }).isRequired
    ).isRequired,
    onAddLabel: PropTypes.func.isRequired,
    onRemoveLabel: PropTypes.func.isRequired,
    onChangeLabel: PropTypes.func.isRequired
  }

  static defaultProps = {
    question: '',
    isRequired: false,
    scoregroup: {
      labels: [],
      items: []
    }
  }
  
  render() {
    return (
      <div>
        <h3>Labels</h3>
        {this.props.labels.map(this._renderLabel)}
	<p>
          <Button onClick={() => this.props.onAddLabel('')}
                  bsStyle='success'
                  ariaLabel='Add label'
                  title='Add label'
                  >
            <Glyphicon glyph="plus" />
          </Button>
        </p>
      </div>
    );
  }

  // TODO almost identical to Choice._renderChoice, factor out to util?
  _renderLabel = (label, index) => {
    return (
      <div className="form-group">
        <div className="input-group">
          <Validate
                  isRequired={true}
                  onChange={this._updateLabelValidation.bind(this, index)}
                  >
            <input
                    className="form-control"
                    type='text'
                    onChange={(e) => this.props.onChangeLabel(index, e)}
                    value={label}
            />
        </Validate>
        <span className="input-group-btn">
        <Button onClick={() => this.props.onRemoveLabel(index)}
                bsStyle='danger'
                ariaLabel='Remove label'
                title='Remove label'
                >
          <Glyphicon glyph="remove" />
        </Button>
        </span>
      </div>
      </div>
    );
  }

  _updateLabelValidation() {

  }
}
