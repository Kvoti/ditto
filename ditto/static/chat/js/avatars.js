// TODO move all avatar related stuff in to here
$(document).on('connected.ditto.chat', function (e, conn) {
    $('div[data-avatar]').each(function () {
        var div = $(this);
        var avatar = DITTO.chat.getAvatar(div.data('name'), div.data('size'));
        div.append(avatar);
    });
});
