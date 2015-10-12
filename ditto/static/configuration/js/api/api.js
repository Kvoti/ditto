var SettingsActionCreators = require('../actions/SettingsActionCreators');
var urls = require('../../../flux-chat/js/utils/urlUtils');

import { get, put, patch } from '../../../js/request';

module.exports = {

  getRegFormSettings: function (role) {
        get(urls.api.forms(role))
            .done(res => {
                SettingsActionCreators.receiveRegFormSettings(role, res);
            });
    },

    updateRegFormSettings: function (role, settings) {
        put(
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

  updateValues: function (role, name, value) {
        patch(
            urls.api.values(role),
          {[name]: value}
        );
    }
}
