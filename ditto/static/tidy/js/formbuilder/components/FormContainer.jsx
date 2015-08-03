import React from 'react';

import { get } from '../../../../js/request';
import Form from './Form';
import camelCaseify from '../../lib/camelCaseify';

const APIURL = '/di/api/formbuilder/';

export default class FormContainer extends React.Component {
  /* static propTypes = {
     } */

  state = {
    forms: undefined
  }

  componentDidMount() {
    get(APIURL)
      .done(res => {
        camelCaseify(res);
        this.setState({forms: res});
      });
  }

  render() {
    console.log(this.state);
    return this.state.forms ? <Form {...this.state.forms[0]}/> : null;
  }
}
