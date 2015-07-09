// Util functions for making ajax requests
// (using jquery for now but will probably replace with superagent at some point)

export function post (url, payload) {
    // return the request so you can add success/failure handlers etc.
    return $.ajax({
	url: url,
	type: "POST",
	data: JSON.stringify(payload),
	contentType: "application/json; charset=utf-8",
	dataType: "json",
    });
}

export function get (url) {
    return $.get(url);
}
