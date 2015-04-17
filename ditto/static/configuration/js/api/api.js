var SettingsActionCreators = require('../actions/SettingsActionCreators');

module.exports = {

    getRegFormSettings: function (role) {
        $.get(
            '/di/forms/api/' + role + '/',
            function (res) {
                console.log(res);
                SettingsActionCreators.receiveRegFormSettings(role, res);
            }
        );
    },

    updateRegFormSettings: function (role, settings) {
        $.post(  // or put?
            '/di/forms/api/' + role + '/',
            JSON.stringify(settings)
        );
    }
}
