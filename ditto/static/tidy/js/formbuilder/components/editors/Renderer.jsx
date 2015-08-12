import React, { PropTypes } from 'react';

import * as schemaTypes from '../../../lib/schema/proxies';
import DelayedControl from '../../../lib/form/DelayedControl';
import Row from './Row';

export default class Renderer extends React.Component {

  static propTypes = {
    question: PropTypes.object
    // Like fixedDataTable have *lots* of hooks to customise?
    //rowRenderer: PropTypes.func,
    //fieldRenderer: PropTypes.func,
  }

  render() {
    let parts = [];
    let question = this.props.question;
    for (let key in question) {
      if (question.hasOwnProperty(key)) {
        parts.push(this._renderPart(key, question[key]));
      }
    }
    return (
      <div>
        {parts}
      </div>
    );
  }

  _renderPart(name, part) {
    if (name === 'chain') {
      return null;
    }
    if (part instanceof schemaTypes.ShapeManager || part instanceof schemaTypes.ArrayManager) {
      let parts = [];
      for (let k in part) {
        if (part.hasOwnProperty(k) && part[k] instanceof schemaTypes.MemberManager) {
          parts.push(this._renderPart(k, part[k].item));
        }
      }
      return (
        <fieldset>
          <legend>{this._toLabel(name)}</legend>
          {part.errors.map(e => <p>{e}</p>)}
          {parts}
        </fieldset>
      );
    }
    if (part instanceof schemaTypes.StringManager) {
      let errors;
      if (!part.errors.length && !part.isRequired && part.get() === '') {
        errors = null;
      } else {
        errors = part.errors;
      }
      return (
        <Row key={name} errors={errors}>
          <label>{this._toLabel(name)}</label>
          <DelayedControl
                  immediate={part.question.isBound}
                  onChange={(v) => part.set(v)}
                  onPendingChange={(v) => part.pend().set(v)}
                  >
            <input
                    type="text"
                    value={part.getPendingOrCurrent()}
            />
          </DelayedControl>
        </Row>
      );
    }
    if (part instanceof schemaTypes.BoolManager) {
      return (
        <Row key={name}>
          <label>{this._toLabel(name)}</label>
          <input
                  type="checkbox"
                  onChange={(e) => part.set(e.target.checked)}
                  checked={part.getPendingOrCurrent()}
          />
        </Row>
      );
    }
    if (part instanceof schemaTypes.IntegerManager) {
      return (
        <Row key={name} errors={!part.isRequired && part.get() === null ? null : part.errors}>
          <label>{this._toLabel(name)}</label>
          <DelayedControl
                  immediate={part.question.isBound}
                  onChange={(v) => part.set(v || null)}
                  onPendingChange={(v) => part.pend().set(v || null)}
                  >
            <input
                    type="text"
                    value={part.getPendingOrCurrent()}
            />
          </DelayedControl>
        </Row>
      );
    }
    return null;
  }

  _toLabel(name) {
    name = name.replace(/([A-Z])/, (m, p1) => ' ' + p1.toLowerCase());
    name = name.replace(/^([a-z])/, (m, p1) => ' ' + p1.toUpperCase());
    return name;
  }
}
