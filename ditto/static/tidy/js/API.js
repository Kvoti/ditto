import APIActionFactory from './lib/APIActionFactory';
import APIStoreFactory from './lib/APIStoreFactory';
import APIConf from './APIConf';

const API = {
    reducers: APIStoreFactory(APIConf),
    actions: APIActionFactory(APIConf),
}

export default API;
