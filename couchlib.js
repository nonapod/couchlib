/*
 * Module for dealing with couchdb requests
 * written by Leslie.A.Cordell 2014
 * MIT LICENSE
 */

module.exports = function couchlib(options) {
	/* Set up our class, if the options aren't an object, throw an error */
	options = options || {};
	var isObj = Object.prototype.toString.call(options).match(/Object/);
	if(!isObj) {
		throw new Error("Couchlib can only be initialised with an object");
	}

	/* Initialise couchlib */
	if("host" in options) this.host = options.host;		
	if("port" in options) this.port = options.port;		
	if("user" in options) this.user = options.user;		
	if("password" in options) this.password = options.password;		

	/* callback function to run our request */
	this.run = function runRequest(options, callback) {
		/* Take in an object of options; the following is an options object example
		 *	{
		 *		"host": "www.example.com",
		 *		"port": "80",
		 *		"method": "POST",
		 *		"path": "/index?action=1223&php=off",
		 *		"headers": {"Header Name": "Header Option"}
		 *		"auth" : "user:password"
		 *	}
		 *
		 */
		/* Some constants */
		var DATA = "data";
		var END = "end";
		var ERROR = "error";
		var http = require('http');
		var querystring = require('querystring');
		var request;
	
		/* If we get an alternate host, port or set or auth, use is, otherwise use our
     * instance settings */
		if(!("host" in options) && this.host) options.host = this.host;
		if(!("port" in options) && this.port) options.port = this.port;
		if(!("auth" in options) && this.user && this.password) options.auth = (this.user + ":" + this.password);

		/* If we have any data, JSON stringify it */
		if("data" in options) { 
			options.data = JSON.stringify(options.data);
			/* If there's no headers, set some default ones */
			if(!("headers" in options)) {
				options.headers = {"Accept": "Application/json", "Content-Type": "Application/json"};
			}			
			else { 
				/* If we do have headers, but accept isn't in them, set it to JSON */
				if(!("Accept" in options.headers)) {
					options.headers.Accept = "Application/json";
				}
				/* If we do have headers, but content-type isn't in them, set it to JSON */
				if(!("Content-Type" in options.headers)) {
					options.headers.Accept = "Application/json";
				}	
			}
		}

		/* Callback for our request */
		function onRequest(res) { 
			var result = "";
			/* Everytime we get a piece of data, add it to our result */
			res.on(DATA, function appendToResult(segment) {
				result += segment;
			}); // End appendToResult

			/* As soon as we get the end signal, pass our result to the callback */
			res.on(END, function returnResult(segment) {
				callback(result);
			}); // End returnResult
		} // End callback

		/* Callback for error handling */
		function onError(error) { 
			console.log({"Error": error}); 
		}

		/* Go ahead and run our request */
		request = http.request(options, onRequest);
		/* If we have post data, write it to the request it */
		if(options.data) request.write(options.data);
		request.on(ERROR, onError);
		request.end();	
	}; // End run

	/* These need to be extended eventually, but they'll work now for basic functionality */

	/* Run a get request, take a path and a callback */
	this.get = function(path, callback) {
		this.run({"method": "GET", "path": path}, callback);
	}; // End get

	/* Run a put request, take a path, data and a callback */
	this.put = function(path, data, callback) {
		this.run({"path": path, "data": data, "method": "PUT"}, callback);
	}; // End put

	/* Run a delete request, take a path, data and a callback */
	this.delete = function(path, data, callback) {
		/* Enable the deleted flag if it's not set */
		data._deleted = true;
		this.run({"path": path, "data": data, "method": "DELETE"}, callback);
	}; // End put

	/* Create a database, take a database name and a callback */
	this.create = function(dbname, callback) {
		/* Strip any forward slashes and then add one at the beginning*/
		dbname = "/" + dbname.replace(/\//g, "");
		this.run({"path": dbname, "method" :"PUT"}, callback);
	}; // End create

	/* Destroy a database, take a database name and a callback */
	this.destroy = function(dbname, callback) {
		/* Strip any forward slashes and then add one at the beginning*/
		dbname = "/" + dbname.replace(/\//g, "");
		this.run({"path": dbname, "method" :"DELETE"}, callback);
	}; // End create

}; // End couchlib


