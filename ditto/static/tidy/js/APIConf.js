import * as actions from './lib/APIActions';

const APIConf = {
    casenotes: {
        url: 'casenotes/',
        actions: [actions.list, actions.retrieve, actions.create]
    }
}

export default APIConf;
