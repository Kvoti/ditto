//
// Get your roster and redirect to messages page for first person in your roster
//
(function () {
    var connection;
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.roster.registerCallback(handleRoster);
	connection.roster.get();
    });

    function handleRoster (roster, item) {
        console.log(roster, item);
        $.each(roster, function (i, friend) {
            if (friend.subscription === 'both') {
                username = Strophe.getNodeFromJid(friend.jid);
                window.location.href = username;
            }
        });
    }
    
})();
