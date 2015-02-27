(function () {
    var carousel_indicators = $('.carousel-indicators');
    var carousel_inner = $('.carousel-inner');
    var users_per_panel = 9;
    var avatar_size = 75;
    
    DITTO.chat.renderPresence = function () {
        var self = this;
        var panel;
        var inner = $('<div></div>');
        var i = 0; // TODO don't need this counter now this.presence is a list
        
        $.each(this.presence, function (j, user) {
            i += 1;
            if (!panel) {
                panel = $('<div class="item"></div>');
                inner.append(panel);
            }
	    var avatar = self.getAvatar(user, avatar_size, true);
            panel.append(avatar);
            if (i && i % users_per_panel == 0) {
                panel = undefined;
            }
        });
        carousel_inner.empty();
        carousel_indicators.empty();
        inner.find('>div:first').addClass('active');
        inner.find('>div').each(function (i) {
            carousel_indicators.append(
                $('<li data-target="#carousel-example-generic" data-slide-to="' + i + '"></li>')
            )
        });
        carousel_indicators.find('li:first').addClass('active');
        carousel_inner.append(inner.find('>div'));
    }
})();
