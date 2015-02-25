(function () {
    var carousel_indicators = $('.carousel-indicators');
    var carousel_inner = $('.carousel-inner');
    var users_per_panel = 9;
    
    DITTO.chat.renderPresence = function () {
        var self = this;
        var panel;
        var inner = $('<div></div>');
        var i = 0;
        
        $.each(this.presence, function (user) {
            i += 1;
            if (!panel) {
                panel = $('<div class="item"></div>');
                inner.append(panel);
            }
	    var avatar = self.getAvatar(user, 100);
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
