// This file bootstraps the entire application.

var ChatApp = require('./components/ChatApp.react');
var ChatWebAPIUtils = require('./utils/ChatWebAPIUtils');
var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

ChatWebAPIUtils.connect(
    chatConf.server,
    chatConf.me,
    chatConf.password,
    chatConf.chatroom,
    chatConf.nick
);	

React.render(
    <ChatApp />,
    document.getElementById('react')
);
