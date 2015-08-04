import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import Validate from '../../../lib/form/Validate';
import TextItem from './TextItem';

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
    onChangeLabel: PropTypes.func.isRequired,
    onAddItem: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired,
    onChangeItem: PropTypes.func.isRequired
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
        <h3>Items</h3>
        {this.props.items.map(this._renderItem)}
	<p>
          <Button onClick={() => this.props.onAddItem('')}
                  bsStyle='success'
                  ariaLabel='Add item'
                  title='Add item'
                  >
            <Glyphicon glyph="plus" />
          </Button>
        </p>
      </div>
    );
  }

  _renderLabel = (label, index) => {
    return (
      <TextItem
              name="label"
              id={index}
              value={label}
              onChange={this.props.onChangeLabel}
              onRemove={() => { this.props.onRemoveLabel(index); }}
              onValidationChange={(index, isValid) => {}}
      />
    );
  }

  _renderItem = (item, index) => {
    return (
      <TextItem
              name="item"
              id={index}
              value={item.text}
              onChange={this.props.onChangeItem}
              onRemove={() => this.props.onRemoveItem(index)}
              onValidationChange={(index, isValid) => {}}
      />
    );
  }
}
