// Util functions for making ajax requests
// (using jquery for now but will probably replace with superagent at some point)

export function get (url) {
    return $.get(url);
}

export function post (url, payload) {
    // return the request so you can add success/failure handlers etc.
    return send(url, payload, "POST");
}

export function put (url, payload) {
    return send(url, payload, "PUT");
}

export function del (url) {
    return $.ajax({
	url: url,
	type: "DELETE",
	dataType: "json",
    });
}    

function send (url, payload, method) {
    return $.ajax({
	url: url,
	type: method,
	data: JSON.stringify(payload),
	contentType: "application/json; charset=utf-8",
	dataType: "json",
    });
}    
