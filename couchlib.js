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
	/* Default host to localhost*/
	else this.host = "127.0.0.1";
	if("port" in options) this.port = options.port;		
	/* Default port to 5984 */
	else this.port = "5984";
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
	
		/* If we get an alternate host, port or set or auth, use is, otherwise use our instance settings */
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
				/* If we do have headers, but accept isn't in them, default it to JSON */
				if(!("Accept" in options.headers)) {
					options.headers.Accept = "Application/json";
				}
				/* If we do have headers, but content-type isn't in them, default it to JSON */
				if(!("Content-Type" in options.headers)) {
					options.headers.Accept = "Application/json";
				}
			} // End else
		} // End if data in options

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
			/* Just console log for now */
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
	/* If there are 3 arguments, the 2nd argument becomes data */
	this.get = function(path, callback) {
		var data = {};
		if(arguments.length == 3 ) {
			data = arguments[1];
			callback = arguments[2];
		}
		path = "/" + path.replace(/\//g, "");
		this.run({"method": "GET", "data" : data, "path": path}, callback);
	}; // End get

	/* Run a put request, take a path, data and a callback */
	this.put = function(path, data, callback) {
		path = "/" + path.replace(/\//g, "");
		this.run({"path": path, "data": data, "method": "PUT"}, callback);
	}; // End put

	/* Run a post request, take a path, data and a callback */
	this.post = function(path, data, callback) {
		path = "/" + path.replace(/\//g, "");
		this.run({"path": path, "data": data, "method": "POST"}, callback);
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

	/* Get the couchdb version, take in a callback */
	this.version = function(callback) {
		this.get("/", function(response){
			/* If we get a version number pass it to the callback */
			var error = "Unable To Get Version";
			response = JSON.parse(response);
			if("version" in response) {
				if(callback) callback(response.version);
				else console.log(response.version); 
			}
			else {
				if(callback) callback(error);
				else console.log(error); 
			}
		}); // End get
	}; // End version

	/* Show databases, take in a callback */
	this.databases = function(callback) {
		if(callback) this.get("_all_dbs", callback);
		else this.get("_all_dbs", function(response){
			console.log(response);
		});
	}; // End databases

	/* Get uuids, take in a count and a callback */
	this.uuid = function(count, callback) {
		if(callback) this.get("_uuids?count=" + count, callback);
		else this.get("_uuids?count=" + count, function(response){
			console.log(response);
		});
	}; // End uuid 

}; // End couchlib


