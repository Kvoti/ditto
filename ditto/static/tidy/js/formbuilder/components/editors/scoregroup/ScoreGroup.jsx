import React, { PropTypes } from 'react';
import Sortable from 'react-components/Sortable';

import Question from './Question';
import Row from './Row';
import Column from './Col';
import Label from './Label';
import Score from './Score';
import Input from './Input';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';

export default class ScoreGroup extends React.Component {

  render() {
    let spec = this.props.question;
    let textColSize = Math.max(
            ...spec.scoregroup.items.members.map(
              m => Math.sqrt(String(m[1].text.get()).length) * 45 + 30
            )
    );
    let labelColSizes = spec.scoregroup.labels.members.map(l =>
      Math.sqrt(String(l[1].label.get()).length) * 40 + 60
    );
    let { labels, items } = spec.scoregroup;
    return (
      <div>
        <Question question={spec.question} isRequired={spec.isRequired} />
        <Row>
          <Column
                  style={{width: textColSize}}
                  >
          </Column>
          {this._renderLabels(labels, labelColSizes)}
          {labels.canAdd() ? this._renderAddLabel(labels) : null}
        </Row>
        {this._renderItems(items, textColSize, labelColSizes)}
        {items.canAdd() ? this._renderAddItem(items) : null}
      </div>
    );
  }

  _renderLabels(labels, labelColSizes) {
    let labelCols = labels.members.map(([i, label]) => {
      return (
        <Column
                style={{width: labelColSizes[i]}}
                key={i}
                draggable={true}
                orderingIndex={label.key}
                >
          <Label label={label} />
        </Column>
      );
    });
    return (
      <Sortable
              className='scoregroup-labels'
              components={labelCols}
              onReorder={this._reorder.bind(this, labels)}
      />
    );
  }

  _renderAddLabel(labels) {
    return (
      <Column>
        <AddButton
                onClick={() => labels.add()}
                >
          Add label
        </AddButton>
      </Column>
    );
  }

  _renderItems(items, textColSize, labelColSizes) {
    let itemRows = items.members.map(([i, item]) => {
      return (
        <Row key={i} draggable={true} orderingIndex={item.key}>
          <Column
                  style={{width: textColSize}}
                  >
            <Input
                    errors={item.text.errors}
                    value={item.text.get()}
                    onChange={(e) => item.text.set(e.target.value)}
            />
          </Column>
          {item.scores.members.map(([j, score]) => {
            return this._renderItemScore(item, score, labelColSizes);
           })}
          <Column>
            {item.canRemove() ? this._renderItemRemove(item) : null}
          </Column>
        </Row>
      );
    });
    return (
      <Sortable
              components={itemRows}
              onReorder={this._reorder.bind(this, items)}
      />
    );
  }

  _renderAddItem(items) {
    return (
      <AddButton
              onClick={() => items.add()}
              >
        Add item
      </AddButton>
    );
  }

  _renderItemScore(item, score, labelColSizes) {
    return (
      <Column
              style={{width: labelColSizes[score.key]}}
              key={item.text.get() + score.key}
              centered={true}
              >
        <Score
                score={score}
                name={item.text.get()}
        />
      </Column>
    );
  }

  _renderItemRemove(item) {
    return (
      <RemoveButton
              onClick={item.remove}
              ariaLabel="Remove item"
              title="Remove item"
      />
    );
  }

  _reorder(itemsManager, reorderedComponents) {
    itemsManager.reorder([for (c of reorderedComponents) c.props.orderingIndex]);
  }
}
