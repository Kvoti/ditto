DITTO.chat.renderPresence = function () {
    this.presence_ui.empty();
    var self = this;
    $.each(this.presence, function (user) {
	var avatar = self.getAvatar(user, null, 100);
	self.presence_ui.append(avatar);
    });
}
