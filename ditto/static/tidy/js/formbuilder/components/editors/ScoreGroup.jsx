import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import Validate from '../../../lib/form/Validate';
import TextItem from './TextItem';
import AddButton from './AddButton';

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
        {this.props.labels.map((label, index) => {
          return <TextItem
          name="label"
          id={index}
          value={label}
          onChange={this.props.onChangeLabel}
          onRemove={() => { this.props.onRemoveLabel(index); }}
          onValidationChange={(index, isValid) => {}}
          />;
         })}
        <AddButton
                name="label"
                onClick={() => this.props.onAddLabel('')}
        />
        <h3>Items</h3>
        {this.props.items.map((item, index) => {
          return <TextItem
                         name="item"
                         id={index}
                         value={item.text}
                         onChange={this.props.onChangeItem}
                         onRemove={() => this.props.onRemoveItem(index)}
                         onValidationChange={(index, isValid) => {}}
                 />;
        })}
      <AddButton
              name="item"
              onClick={() => this.props.onAddItem('')}
      />
      </div>
    );
  }
}
