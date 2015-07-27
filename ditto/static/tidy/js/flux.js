import Flux from './lib/FluxForAPI';
import APIConf from './APIConf';

const flux = new Flux(DITTO.tenant, APIConf);
export default flux;
