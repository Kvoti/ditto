import React, { PropTypes } from 'react';
import TextItem from './TextItem';
import AddButton from './AddButton';
import DelayedControl from '../../../lib/form/DelayedControl';
import Row from './Row';

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
          errors={this.props.errors.labels[index]}
          name="label"
          id={index}
          value={label}
          onChange={this.props.onChangeLabel}
          onRemove={() => { this.props.onRemoveLabel(index); }}
          onValidationChange={() => this.props.onChangeLabelValidation(index)}
          />;
         })}
        <AddButton
                name="label"
                onClick={this.props.onAddLabel}
        />
        <h3>Items</h3>
        {this.props.items.map((item, index) => {
          return (
            <div>
            <TextItem
                    errors={this.props.errors.items[index]}
                    name="item"
                    id={index}
                    value={item.text}
                    onChange={this.props.onChangeItem}
                    onRemove={() => this.props.onRemoveItem(index)}
                    onValidationChange={() => this.props.onChangeItemValidation(index)}
            />
            {this._renderScores(item, index)}
            </div>
          );
        })}
      <AddButton
              name="item"
              onClick={this.props.onAddItem}
      />
      </div>
    );
  }

  _renderScores = (item, index) => {
    return item.scores.map((score, i) => {
      return (
        <Row
                errors={this.props.errors[`scores${index}`][i]}
                >
          <label>{this.props.labels[i]}</label>
          <DelayedControl
                  validate={() => this.props.onChangeScoreValidation(index, i)}
                  >
            <input
                    type="text"
                    value={score}
                    onChange={(e) => this.props.onChangeScore(index, i, e)}
            />
          </DelayedControl>
        </Row>
      );
    });
  }
}
