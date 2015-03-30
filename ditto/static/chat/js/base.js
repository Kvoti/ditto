var ChatWebAPIUtils = require('../../flux-chat/js/utils/ChatWebAPIUtils');
var Avatar = require('../../flux-chat/js/components/Avatar.react.js');
var AvatarPicker = require('../../js/components/AvatarPicker.jsx');
var WhosOnline = require('../../flux-chat/js/components/WhosOnline.react');
var MessageComposer = require('../../flux-chat/js/components/MessageComposer.react');
var ChatModule = require('../../js/components/ChatModule.jsx');
var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

ChatWebAPIUtils.connect(
    chatConf.server,
    chatConf.me,
    chatConf.password,
    chatConf.chatroom,
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
    
var chatModule = document.getElementById('chat-module') ||
    document.getElementById('msgs');
if (chatModule) {
    React.render(
            <ChatModule fluidHeight={true} />,
        chatModule
    );
}

var whosOnline = document.getElementById('presence');
if (whosOnline) {
    React.render(
        <WhosOnline />,
        whosOnline
    );
}

var compose = document.getElementById('compose');
if (compose) {
    React.render(
            <MessageComposer threadID={Strophe.getNodeFromJid(chatConf.chatroom)}/>,
        compose
    );
}
