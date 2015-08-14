import React, { PropTypes } from 'react';
import classNames from 'classnames';

import * as schemaTypes from '../../../lib/schema/proxies';
import DelayedControl from '../../../lib/form/DelayedControl';
import { Button, Glyphicon } from 'react-bootstrap';
import Sortable from 'react-components/Sortable';
import getID from '../../../lib/id';

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
    if (name === 'chain' || 'name' === 'item' && name === 'question') {
      return null;
    }
    if (!this._isLeaf(part)) {
      return this._renderCollection(part, options);
    }
    return this._renderItem(part, name, options);
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
                onReorder={components => part.reorder([for (c of components) c.props.index])}
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

  _renderItem(part, name, options) {
    let errors = this._getItemErrors(part);
    let ID = this._getItemID(part);
    return (
      <div
	      key={part.path}
              draggable={options && options.canReorder}
              className={this._rowClassNames(errors)}
	      index={options && options.itemIndex}
              >
        <label className="control-label col-md-4" htmlFor={ID}>
          {this._toLabel(name)}
        </label>
        <div className="col-md-8">
          {this._renderControl(part, name, options)}
	  {this._renderErrors(errors)}
	</div>
      </div>
    );
  }
  
  _renderAddButton(part) {
    if (part.canAdd && part.canAdd()) {
      return (
        <button
		className="btn btn-success"
		onClick={() => part.add()}
		>
          Add
        </button>
      );
    }
    return null;
  }

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

  _getItemID(item) {
    return `${this.controlID}${item.path}`;
  }
  
  _rowClassNames(errors) {
    let validationStatus;
    if (errors !== null) {
      validationStatus = errors.length ? 'error' : 'success';
    }
    return classNames(
      'form-group',
      {
        'has-feedback': validationStatus,
        [`has-${validationStatus}`]: validationStatus
      }
    );
  }

  _renderValidation(errors) {
    let validationIcon;
    let validationStatus;
    if (errors !== null) {
      validationIcon = errors.length ? 'remove' : 'ok';
      validationStatus = errors.length ? 'error' : 'success';
    }
    let glyphClassNames = classNames(
      'glyphicon',
      'form-control-feedback',
      `glyphicon-${validationIcon}`
    );
    let aria = `inputStatus-${this.props.id}`;
    return (
      <span>
        {validationIcon ? <span className={glyphClassNames} aria-hidden="true"></span> : null}
        {validationIcon ? <span id={aria} className="sr-only">({validationStatus})</span> : null}
      </span>
    );
  }

  _renderErrors(errors) {
    return errors && errors.map((e) => <p key={e} className="help-block">{e}</p>);
  }
  
  _renderControl(part, name, options) {
    let ID = this._getItemID(part);
    if (part instanceof schemaTypes.StringManager) {
      let errors = this._getItemErrors(part);
      let control = (
	<div style={{position: 'relative'}}>
          <DelayedControl
                  immediate={part.question.isBound}
                  onChange={(v) => part.set(v)}
                  onPendingChange={(v) => part.pend().set(v)}
                  >
            <input
		    id={ID}
		    className="form-control"
                    type="text"
                    value={part.getPendingOrCurrent()}
            />
          </DelayedControl>
	  {this._renderValidation(errors)}
	</div>
      );
      if (!options || !options.removeItem) {
	return control;
      }
      return (
        <div className='input-group'>
	  {control}
          <span className="input-group-btn">
            <Button onClick={options.removeItem}
                    bsStyle='danger'
                    ariaLabel={'Remove ' + name}
                    title={'Remove ' + name}
                    >
              <Glyphicon glyph="remove" />
            </Button>
          </span>
        </div>
      );
    }
    if (part instanceof schemaTypes.BoolManager) {
      return (
        <input
		id={ID}
                type="checkbox"
                onChange={(e) => part.set(e.target.checked)}
                checked={part.getPendingOrCurrent()}
        />
      );
    }
    if (part instanceof schemaTypes.IntegerManager) {
      return (
	<DelayedControl
		immediate={part.question.isBound}
		onChange={(v) => part.set(this._toInt(v))}
		onPendingChange={(v) => part.pend().set(this._toInt(v))}
		>
          <input
		  id={ID}
		  className="form-control"
                  type="text"
                  value={part.getPendingOrCurrent()}
          />
	</DelayedControl>
      );
    }
    return null;
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
  
  _toLabel(name) {
    name = name.replace(/([A-Z])/, (m, p1) => ' ' + p1.toLowerCase());
    name = name.replace(/^([a-z])/, (m, p1) => ' ' + p1.toUpperCase());
    return name;
  }
}
