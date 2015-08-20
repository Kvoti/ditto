var SettingsActionCreators = require('../actions/SettingsActionCreators');
var urls = require('../../../flux-chat/js/utils/urlUtils');

import { get, post } from '../../../js/request';

module.exports = {

    getRegFormSettings: function (role) {
        get(urls.api.forms(role))
            .done(res => {
                SettingsActionCreators.receiveRegFormSettings(role, res);
            });
    },

    updateRegFormSettings: function (role, settings) {
        put( // or put?
            urls.api.forms(role),
            settings
        );
    }
}
