import React from 'react';

import { get } from '../../../js/request';
import Form from './Form';

const APIURL = '/di/api/formbuilder/';

export default class FormContainer extends React.Component {
  /* static propTypes = {
     } */

  state = {
    form: undefined
  }

  componentDidMount() {
    get(APIURL)
      .done(res => {
        this.setState({form: res});
      });
  }

  render() {
    return <Form {...this.state.form}/>;
  }
}
