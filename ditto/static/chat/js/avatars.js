// TODO move all avatar related stuff in to here
$(document).on('connected.ditto.chat', function (e, conn) {
    $('div[data-avatar]').each(function () {
        var div = $(this);
        var avatar = DITTO.chat.getAvatar(div.data('name'), div.data('size'));
        div.append(avatar);
    });

    var avatars = $('.avatar-profile');
    if (avatars.length) {
        var menu = avatars.find('ul');
        // Horrible hacking around here as all the avatars are on top of each other
        avatars.find('g').show();
        var svg = avatars.find('svg');
        svg.find('>g[id!=guides]').each(function () {
            var svg_clone = svg.clone();
            svg_clone.find('>g').remove();
            svg_clone.append($(this));
            var item = $('<li><a href="#"></a></li>');
            item.find('a').append(svg_clone).data('avatar', $(this).attr('id'));
            menu.append(item);
        });
	svg.remove();
    }

    $('.avatar-profile .dropdown-menu').on('click', 'a', function () {
	var graphic = $(this).data('avatar');
	DITTO.chat.vcard.set(graphic);
	// TODO update in page avatars in a nice way
	window.location = window.location.href;
    });
    
});
