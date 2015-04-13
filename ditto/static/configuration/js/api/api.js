var SettingsActionCreators = require('../actions/SettingsActionCreators');

module.exports = {

    getRegFormSettings: function (role) {
        $.get(
            '/di/forms/reg/api/',
            function (res) {
                console.log(res);
                SettingsActionCreators.receiveRegFormSettings(role, res);
            }
        );
    },

    updateRegFormSettings: function (role, settings) {
        $.post(  // or put?
            '/di/forms/reg/api/',
            JSON.stringify(settings)
        );
    }
}
