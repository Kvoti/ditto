import React, { PropTypes } from 'react';

import getID from '../../../../lib/id';
import Sortable from 'react-components/Sortable';
import * as schemaTypes from '../../../../lib/schema/proxies';
import ControlRow from './ControlRow';
import AddButton from './AddButton';

export default class Renderer extends React.Component {
  constructor(props) {
    super(props);
    this.controlID = getID();
  }
  
  static propTypes = {
    question: PropTypes.object
  }

  render() {
    let parts = [];
    let question = this.props.question;
    for (let key in question) {
      if (question.hasOwnProperty(key) && question[key] && question[key].pend) {
        parts.push(this._renderPart(key, question[key]));
      }
    }
    return (
      <div className="well">
        {parts}
      </div>
    );
  }

  _renderPart(name, part, options) {
    if (name === 'chain') {
      return null;
    }
    if (this._isLeaf(part)) {
      return this._renderItem(part, name, options);
    }
    return this._renderCollection(part, options);
  }
  
  _isLeaf(part) {
    return (
      !(part instanceof schemaTypes.ShapeManager) &&
      !(part instanceof schemaTypes.ArrayManager)
    );
  }

  _renderCollection(part, options) {
    let parts = [];
    for (let k in part) {
      if (k !== 'chain' && part.hasOwnProperty(k) && part[k] instanceof schemaTypes.MemberManager) {
        let removeItem;
        if (part.canRemove && part.canRemove()) {
          removeItem = () => part.remove(k);
        }
        parts.push(this._renderPart(k, part[k].item, {
	  removeItem,
	  itemIndex: k,
	  canReorder: part.options && part.options.canReorder
	}));
      }
    }
    if (part.options && part.options.canReorder) {
      parts = (
        <Sortable
                components={parts}
                onReorder={components => part.reorder([for (c of components) c.props.orderingIndex])}
        />
      );
    }
    return (
      <div
	      key={part.path}
              draggable={options && options.canReorder}
	      index={options && options.itemIndex}
	      >
	{parts}
	<div className="col-md-offset-4">
	  {this._renderAddButton(part)}
	</div>
      </div>
    );
  }

  _renderAddButton(part) {
    if (part.canAdd && part.canAdd()) {
      return <AddButton onClick={() => part.add()} />;
    }
    return null;
  }
  
  _renderItem(part, name, options) {
    let ID = this._getItemID(part);
    let errors = this._getItemErrors(part);
    let type;
    let onChange;
    let onPendingChange;
    // TODO add type property to XManager instead?
    if (part instanceof schemaTypes.StringManager) {
      type = 'string';
      onChange = (v) => part.set(v);
      onPendingChange = (v) => part.pend().set(v);
    } else if (part instanceof schemaTypes.BoolManager) {
      type = 'bool';
      onChange = (v) => part.set(v);
    } else if (part instanceof schemaTypes.IntegerManager) {
      onChange = (v) => part.set(this._toInt(v));
      onPendingChange = (v) => part.pend().set(this._toInt(v));
    }
    return (
      <ControlRow
	      key={part.path}
	      id={ID}
	      name={name}
	      type={type}
              value={part.getPendingOrCurrent()}
	      errors={errors}
              validateImmediately={part.question.isBound}
	      onChange={onChange}
	      onPendingChange={onPendingChange}
	      onRemove={options && options.removeItem}
	      orderingIndex={options && options.itemIndex}
      />
    );
  }
	      
  _getItemID(item) {
    return `${this.controlID}${item.path}`;
  }

  // TODO this logic probably belongs in the Managers
  _getItemErrors(item) {
    if (item instanceof schemaTypes.StringManager &&
      (!item.isBound ||
       !item.errors.length && !item.options.isRequired && item.get() === '')
    ) {
      return null;
    }
    if (item instanceof schemaTypes.BoolManager &&
      (!item.isBound ||
       !item.errors.length && !item.options.isRequired)
    ) {
      return null;
    }
    if (item instanceof schemaTypes.IntegerManager &&
      (!item.errors.length && !item.options.isRequired && item.get() === null)) {
	return null;
    }
    return item.errors;
  }

  _toInt(value) {
    if (value === '') {
      return null;
    }
    let parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      return value;
    }
    return parsed;
  }
  
}
