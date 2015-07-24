require("babel/polyfill");
var ChatApp = require('../../flux-chat/js/components/ChatApp.react');
var ChatRoomApp = require('../../flux-chat/js/components/ChatRoomApp.jsx');
var ChatWebAPIUtils = require('../../flux-chat/js/utils/ChatWebAPIUtils');
var SettingsWebAPIUtils = require('../../configuration/js/utils/SettingsWebAPIUtils');
var AvatarContainer = require('../../flux-chat/js/components/AvatarContainer.react.js');
var Status = require('../../flux-chat/js/components/Status.react.js');
var AvatarPicker = require('../../js/components/AvatarPicker.jsx');
var WhosOnline = require('../../flux-chat/js/components/WhosOnline.react');
var MessageComposer = require('../../flux-chat/js/components/MessageComposer.react');
var ChatModule = require('../../js/components/ChatModule.jsx');
var EvaluationSettings = require('../../configuration/js/components/EvaluationSettings.jsx');
var ChatroomSettings = require('../../configuration/js/components/ChatroomSettings.jsx');
var FormBuilder = require('../../formbuilder/js/components/FormBuilder.jsx');
var CaseNotes = require('../../tidy/js/casenotes/CaseNotesContainer.jsx');
var UserAutocomplete = require('../../js/components/UserAutocomplete.jsx');
var TicketTable = require('../../tickets/js/components/TicketTable.jsx');
var UserTable = require('../../users/js/components/UserTable.jsx');
var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

if (chatConf.me) {
    ChatWebAPIUtils.connect(
        chatConf.server,
        chatConf.me,
        chatConf.password,
        chatConf.nick
    );	

    // TODO should only load this on settings page(s)
    SettingsWebAPIUtils.loadRoles();
}

var user = Strophe.getNodeFromJid(chatConf.me);
var avatar = document.getElementById('nav-avatar');
if (avatar) {
    React.render(
        <AvatarContainer username={user} />, avatar
    );
}
// TODO not sure whether to have a single bundle.js or make different
// bundles for different pages that have different bits of chat
// on/off. A single file with conditional bits is easiest for now
var changeAvatar = document.getElementById('change-avatar');
if (changeAvatar) {
    React.render(
        <AvatarPicker />,
        changeAvatar
    );
}

var profileAvatar = document.getElementById('profile-avatar');
if (profileAvatar) {
    React.render(
            <AvatarContainer username={hackGetClient()} size={150} />,
        profileAvatar
    );
}
    
var chatModule = document.getElementById('chat-module');
if (chatModule) {
    React.render(
        <ChatModule fluidHeight={false} heightOffset={300} />,
        chatModule || chatroom
    );
}

var chatrooms = document.getElementById('chatrooms');
if (chatrooms) {
    React.render(ChatRoomApp, chatrooms);
}

var whosOnline = document.getElementById('presence');
if (whosOnline) {
    React.render(
            <WhosOnline stacked={false} />,
        whosOnline
    );
}

var chatApp = document.getElementById('react');
if (chatApp) {
    React.render(ChatApp, chatApp);
}

var evaluationSettings = document.getElementById('evaluation');
if (evaluationSettings) {
    React.render(
            <EvaluationSettings />,
        evaluationSettings
    );
}

var chatroomSettings = document.getElementById('chatroomsettings');
if (chatroomSettings) {
    React.render(ChatroomSettings, chatroomSettings);
}

var formBuilder = document.getElementById('formbuilder');
if (formBuilder) {
    React.render(
            <FormBuilder />,
        formBuilder
    );
}

var caseNotes = document.getElementById('casenotes');
if (caseNotes) {
    React.render(
        <CaseNotes />,
        caseNotes
    );
}

var myStatus = document.getElementById('my-status');
if (myStatus) {
    React.render(
        <Status user={hackGetClient()} />,
        myStatus
    );
}

var inputs = document.getElementsByClassName('user-autocomplete');
Array.prototype.forEach.call(inputs, (el) => {
    React.render(
            <UserAutocomplete
        name={el.dataset.perm}
        multi={true}
        value={el.dataset.value && el.dataset.value.split('|')}
            />,
        el
    );
});

var tickets = document.getElementById('tickets');
if (tickets) {
    React.render(
        TicketTable,
        tickets
    );
}

var users = document.getElementById('user-mgmt');
if (users) {
    React.render(
        UserTable,
        users
    );
}

// TODO get this from config (DITTO.client or something)
function hackGetClient () {
    var parts = window.location.href.split('/');
    return parts[parts.length - 2];
}
