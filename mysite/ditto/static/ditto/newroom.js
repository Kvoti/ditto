var connection = null;
$(document).ready(function () {
    var room_jid;
    var name;
    
    $('form').submit(function (e) {
        e.preventDefault();
        var form = $(this);
        var participants = form.find('option:selected')
            .map(function () {
                return $(this).text();
            }).get();

        name = $(this.name).val();

        if (name && participants) {
            createRoom(name, participants);
        } else {
            alert("Please choose a name and some participants!");
        }
    });

    function createRoom(name, participants) {
        room_jid = name + '@muc.' + DITTO.chat_host;
        connection.muc.join(room_jid, DITTO.chat_nick, null,
                            function () { configureRoom(participants); }
                           );
    }

    function configureRoom(participants) {
        connection.muc.createConfiguredRoom(
            room_jid,
            {'muc#roomconfig_membersonly': 1},
            function () { addMembers(participants); }
        );
    }

    function addMembers(participants) {
	var callback = function () { };
        $.each(participants, function (i, participant) {
	    if (participants[participants.length - 1] === participant) {
		callback = function () {
		    window.location.href = '../' + name + '/';
		};
	    }
            connection.muc.member(room_jid, participant + '@' + DITTO.chat_host, "", callback);
        });
    }

    function connect () {
	connection = new Strophe.Connection('ws://' + DITTO.chat_domain + ':5280/ws-xmpp');
	// connection.rawInput = rawInput;
	// connection.rawOutput = rawOutput;
	connection.connect(
	    DITTO.chat_name, DITTO.chat_pass, onConnect
	);
    }
    
    function onConnect (status) {
	if (status == Strophe.Status.CONNECTING) {
	    console.log('Strophe is connecting.');

	} else if (status == Strophe.Status.CONNFAIL) {
	    console.log('Strophe failed to connect.');

	} else if (status == Strophe.Status.DISCONNECTING) {
	    console.log('Strophe is disconnecting.');

	} else if (status == Strophe.Status.DISCONNECTED) {
	    console.log('Strophe is disconnected.');

	} else if (status == Strophe.Status.CONNECTED) {
	    console.log('Strophe is connected.');

	    connection.muc.init(connection);
	}
    }

    function rawInput(data) {
	console.log('RECV: ', data);
    }

    function rawOutput(data) {
	console.log('SENT: ', data);
    }

    connect();
});
