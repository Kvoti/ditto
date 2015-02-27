/* Project specific Javascript goes here. */

// Resizable chat window on someone else's profile
$('.profile-chat').resizable(
    {
        alsoResize: '#pchat_msgs',
        handles: 's',
        stop: function () {
            DITTO.chat.scrollMessages($('#pchat_msgs'));
        }
    }
);

// Expandable 'My Chats' on your own profile page
$('#open-messages').click(function (e) {
    e.preventDefault();
    var button = $(this);
    var is_closed = button.text() === 'Open messages >>';
    var main = $('.main-content');
    var sidebar = $('.main-sidebar');
    var friends = $('#roster');
    var messages = $('.messages');
    
    // TOOD probably slicker to animate this!
    main.toggleClass('hidden');
    sidebar.toggleClass('col-md-3 col-md-12');
    friends.toggleClass('col-md-12 col-md-4');
    messages.toggleClass('hidden');

    friends.find('>div:first').click();
    
    if (is_closed) {
        button.text('Close messages >>');
    } else {
        button.text('Open messages >>');
    }
});
$('#roster').on('click', '>div', function (e) {
    var friend = $(this);
    var friends = friend.parents();
    var username = friend.find('.avatar-name').text();
    var messages = $('.messages-' + username);
    
    // Show current chat partner
    friends.find('>div').removeClass('bg-info');
    friend.addClass('bg-info');

    // Show message pane for current chat partner
    messages.siblings().addClass('hidden');
    messages.removeClass('hidden');
    
    
    // Make sure we send messages to and display messages from the correct chat partner!
    DITTO.chatee = username + '@' + DITTO.chat_host;
});
