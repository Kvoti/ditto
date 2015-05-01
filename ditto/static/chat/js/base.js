require("babel/polyfill");
var ChatApp = require('../../flux-chat/js/components/ChatApp.react');
var ChatRoomApp = require('../../flux-chat/js/components/ChatRoomApp.jsx');
var ChatWebAPIUtils = require('../../flux-chat/js/utils/ChatWebAPIUtils');
var Avatar = require('../../flux-chat/js/components/Avatar.react.js');
var AvatarPicker = require('../../js/components/AvatarPicker.jsx');
var WhosOnline = require('../../flux-chat/js/components/WhosOnline.react');
var MessageComposer = require('../../flux-chat/js/components/MessageComposer.react');
var ChatModule = require('../../js/components/ChatModule.jsx');
var EvaluationSettings = require('../../configuration/js/components/EvaluationSettings.jsx');
var FormBuilder = require('../../formbuilder/js/components/FormBuilder.jsx');

var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

ChatWebAPIUtils.connect(
    chatConf.server,
    chatConf.me,
    chatConf.password,
    chatConf.nick
);	

var user = Strophe.getNodeFromJid(chatConf.me);
React.render(
    <Avatar user={user} />,
    document.getElementById('nav-avatar')
);

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
            <Avatar user={user} size={150} />,
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
    React.render(
        <ChatRoomApp />,
        chatrooms
    );
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
    React.render(
        <ChatApp />,
        chatApp
    );
}

var evaluationSettings = document.getElementById('evaluation');
if (evaluationSettings) {
    React.render(
            <EvaluationSettings />,
        evaluationSettings
    );
}
   
var formBuilder = document.getElementById('formbuilder');
if (formBuilder) {
    React.render(
            <FormBuilder />,
        formBuilder
    );
}
   
