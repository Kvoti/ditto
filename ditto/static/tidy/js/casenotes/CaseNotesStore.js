import APIStoreFactory from '../lib/APIStoreFactory';

import APIConf from './APIConf';

const _store = APIStoreFactory(APIConf, 'casenotes');

const store = {'caseNotes': _store};

export default store;
