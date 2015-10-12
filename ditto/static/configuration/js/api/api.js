var SettingsActionCreators = require('../actions/SettingsActionCreators');
var urls = require('../../../flux-chat/js/utils/urlUtils');

import { get, put } from '../../../js/request';

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
    },
  
  getValues: function (role) {
        get(urls.api.values(role))
            .done(res => {
                SettingsActionCreators.receiveValues(role, res);
            });
    },

    updateValues: function (role, settings) {
        put( // or put?
            urls.api.values(role),
            settings
        );
    }
}
