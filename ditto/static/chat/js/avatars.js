// TODO move all avatar related stuff in to here
$('div[data-avatar]').each(function () {
    var div = $(this);
    var avatar = DITTO.chat.getAvatar(div.data('name'), div.data('size'));
    div.append(avatar);
});
