import Flux from 'redux-rest';
//import Flux from 'redux-rest/src/reduxRest';
import APIConf from './APIConf';

const flux = new Flux(APIConf);
export default flux;
