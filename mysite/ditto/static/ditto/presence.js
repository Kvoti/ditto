(function () {
    var connection;

    var my_status_show = $('#status-show');
    var my_status_status = $('#status-status');
    var my_status_status_enabled = $('#status-status-enabled');
    var my_status_modal = $('#myModal');
    var my_status_modal_save = my_status_modal.find('.btn-primary');
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
    });

    my_status_show.change(function () {
	var show = $(this).val();
	var pres = $pres();
	if (show) {
	    pres.c('show').t(show).up();
	}
        if (my_status_status_enabled.is(':checked')) {
            my_status_status.data('pres', pres);
            my_status_modal.modal('show');
        } else {
            // no custom message so send status immediately
	    connection.send(pres.tree());
        }
    });

    my_status_modal_save.click(function () {
        my_status_modal.modal('hide');
        var pres = my_status_status.data('pres');
	var status = my_status_status.val();
	if (status) {
	    pres.c('status').t(status);
	}
	connection.send(pres.tree());
    });

})();
