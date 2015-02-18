var connection = null;
$(document).ready(function () {
    var room_jid;
    var name;
    
    $('form').submit(function (e) {
        e.preventDefault();
        var form = $(this);
        var members = form.find('option:selected')
            .map(function () {
                return $(this).text();
            }).get();

        name = $(this.name).val();

        if (name && members) {
	    createRoom(name, members)
		.then(configureRoom)
		.then(addMembers)
		.then(loadNewRoom);
        } else {
            alert("Please choose a name and some members!");
        }
    });
    
    function createRoom(name, members) {
	return new Promise(function (resolve, reject) {
            room_jid = name + '@muc.' + DITTO.chat_host;
            connection.muc.join(room_jid, DITTO.chat_nick, null,
				function () { resolve(members); }
                               );
	});
    }
    
    function configureRoom(members) {
	return new Promise(function (resolve, reject) {
            connection.muc.createConfiguredRoom(
		room_jid,
		{'muc#roomconfig_membersonly': 1},
		function () { resolve(members); },
		function () { reject(Error('oops')); }
            );
	});
    }

    function addMembers(members) {
	var ps = $.map(members, function (member) {
	    addMember(member);
        });
	return Promise.all(ps);
    }

    function addMember(member) {
	return new Promise(function (resolve, reject) {
            connection.muc.member(
		room_jid,
		member + '@' + DITTO.chat_host,
		"",
		function () { console.log('added', member);resolve(); }
	    );
	});
    }
	    
    function loadNewRoom() {
	console.log('everyone added');
	window.location.href = '../' + name + '/';
    };

    function connect () {
	connection = new Strophe.Connection('ws://' + DITTO.chat_ip + ':5280/ws-xmpp');
	connection.rawInput = rawInput;
	connection.rawOutput = rawOutput;
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
