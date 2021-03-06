/*
 * couchlib
 * Author: Leslie.A.Cordell 2014
 * MIT LICENSE
 */

/* couchlib
 * @params   - object
 * @returns  - function
 * @description - module exports couchlib, that can be instantiated with an object
 *              - containing options.
 */
module.exports = function couchlib(options) {
	/*@TODO Attachments*/
	/*@TODO Update Design Documents */
	/*@TODO Unit testing for library */
	/*@TODO Maybe implement promises, and a more intuitive way of dealing with library */
  var self = this;
  /* Couchlib is initialised at the end */

  /* run
   * @params - object, function
   * @returns - run callback
   * @description - Take in an object of options, run an http request
   */
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
    */
    /* Some constants */
    var DATA = "data";
    var END = "end";
    var ERROR = "error";
    var GET = "GET";
    var POST = "POST";
    var PUT = "PUT";
    var DELETE = "DELETE";
    var http = require('http');
    var querystring = require('querystring');
    var dataquery;
    var request;

    /* If we get an alternate host, port or set or auth, use is, otherwise use our instance settings */
    if(!(options.host) && this.host) options.host = this.host;
    if(!(options.port) && this.port) options.port = this.port;
    if(!(options.auth) && this.user && this.password) options.auth = (this.user + ":" + this.password);
    if(!(options.path)) options.path = "/";
    if(options.path.charAt(0) != "/") options.path = "/" + options.path;

    /* Make sure we now have a host, port and path */
    if(!options.host && !options.port && !options.path) {
        throw new Error("Request must contain at least  a host, a port and a a path");
    }

    /* If we have any data, JSON stringify it */
    if(options.data) {
      /* Get and delete methods use a query string rather than passing data */
      if(options.method == GET || options.method == DELETE) {
        dataquery = querystring.stringify(options.data);
        /* If we get a valid data querystring, append it to the path along with a ? */
        if(dataquery.length) options.path = options.path + "?" + querystring.stringify(options.data);
                options.data = null; // Wipe the data object, we don't need it
      }
      /* If there's no headers, set some default ones */
      if(!(options.headers)) {
        options.headers = {"Accept": "application/json", "Content-Type": "application/json"};
      }
      else {
        /* If we do have headers, but accept isn't in them, default it to JSON */
        if(!("Accept" in options.headers)) {
          options.headers.Accept = "application/json";
        }
        /* If we do have headers, but content-type isn't in them, default it to JSON */
        if(!("Content-Type" in options.headers)) {
          options.headers["Content-Type"] = "application/json";
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

      /* As soon as we get the end signal, pass our result to the callback or console log it */
      res.on(END, function returnResult() {
        /* If show headers option is true, return the headers with the result */
        if(options._SHOWHEADERS) result = {"result": result, "headers": res.headers};
        if(callback) callback(result);
        else console.log(result);
      }); // End returnResult
    } // End callback

    /* Callback for error handling; pass it to a callback or log it to the console */
    function onError(error) {
      error = JSON.stringify({"Error": error});
      if(callback) callback(error);
      else console.log(error);
    }

    /* Stringify the data */
    if(options.data) options.data = JSON.stringify(options.data);
    /* Go ahead and run our request */
    request = http.request(options, onRequest);
    /* If we have data, and we're not running a get request, write it to the request it */
    if(options.method != GET && options.method != DELETE && options.data) request.write(options.data);
    request.on(ERROR, onError);
    request.end();
  }; // End run

  /* get
  * @params - string, [object], callback
  * @returns - sends parsed JSON to callback
  * @description - Run a get request, take optional data object as 2nd parameter
  *                run a callback to handle request response data. Uses run function.
  */
  this.get = function(path,/*[data]*/ callback) {
    var data = {};
    if(arguments.length == 3) {
      data = arguments[1];
      callback = arguments[2];
    }
    this.run({"method": "GET", "data" : data, "path": path}, callback);
  };

  /* copy
   * @params - string, string, callback
   * @returns - sends parsed JSON to callback
   * @description - Run a copy request, requires a path, destination name, data and callback
   */
  this.copy = function(path, destination, callback) {
    this.run({"method": "COPY", "path": path, "headers": {"Destination": destination}}, callback);
  };

  /* put
   * @params - string, [object], callback
   * @returns - runs callback
   * @description - Run a put request, take optional data object as 2nd parameter
   *                run a callback to handle request response data. Uses run function.
   */
  this.put = function(path,/*[data]*/ callback) {
    var data = {};
    if(arguments.length == 3) {
      data = arguments[1];
      callback = arguments[2];
    }
    this.run({"path": path, "data": data, "method": "PUT"}, callback);
  };

  /* post
   * @params - string, [object], callback
   * @returns - sends parsed JSON to callback
   * @description - Run a post request, take optional data object as 2nd parameter
   *                run a callback to handle request response data. Uses run function.
   */
  this.post = function(path, /*[data]*/ callback) {
    var data = {};
    var options = {"path": path, "method": "POST"};
    if(arguments.length == 3) {
      data = arguments[1];
      callback = arguments[2];
    }
    options.data = data;
    if(data.headers) {
      options.headers = data.headers;
      delete options.data["headers"]
    }
    if(data._SHOWHEADERS) {
      options._SHOWHEADERS = data._SHOWHEADERS;
      delete options.data["_SHOWHEADERS"];
    }
    this.run(options, callback);
  };

  /* del
   * @params - string, [object], callback
   * @returns - sends parsed JSON to callback
   * @description - run a delete request, take optional data object as 2nd parameter
   *                run a callback to handle request response data. Uses run function.
   */
  this.del = function(path, /*data*/ callback) {
    var data = {};
    if(arguments.length == 3) {
      data = arguments[1];
      callback = arguments[2];
    }
    data._deleted = true;
    this.run({"path": path, "data": data, "method": "DELETE"}, callback);
  };

  /* version
   * @params - callback
   * @returns - sends parsed JSON to callback
   * @description - get the couchdb version number
   */
  this.version = function(callback) {
    this.get("/", function(response){
      var error = {"Error": "Unable To Get Version"};
      response = JSON.parse(response);
      if("version" in response) {
        if(callback) callback(response.version);
        else console.log(response.version);
      }
      else {
        if(callback) callback(error);
        else console.error(error);
      }
    });
  };

  /* documents
   * @description - holds the methods listed under documents in the api,
   *                i.e. doc, attachment
   */

  this.documents = {
    /* create
     * @params - string, object, callback
     * @returns - sends parsed JSON to callback
     * @description - creates a new document, needs a database name,
     *                an object schema and a callback. Do not
     *                use this to create many documents, as this
     *                only works with around 100 or so requests this
     *                way. Use documents.many.create() instead.
     */
    create : function(database, schema, callback) {
      /* If no schema provided, create a new blank record */
      schema = schema || {};
      self.server.uuid(1, function(result){
        var uuid;
        var path;
        if(result.uuids) {
          /* Override uuid with schema id if we provided one */
          uuid = schema._id || result.uuids[0];
          path = database + "/" + uuid;
          self.put(path, schema, function(response){
            response = JSON.parse(response);
            if(callback) callback(response);
            else console.log(response);
          });
        }
        else{
          if(callback) callback(result);
          else console.log(result);
        }
      });
    },
    /* update
     * @params - string, string, object, callback
     * @returns - sends parsed JSON to callback
     * @description - Updates a document with some changes,
     *                first gets the json, parses it, then
     *                appends the update to it and reapplies it.
     */
    update : function(database, docid, changes, callback) {
      self.documents.get(database, docid, function(response){
        if(response.error == "not-found") {
          if(callback) callback(response);
          else console.log(response);
        }
        else if(response._rev) {
          changes._rev = response._rev;
          changes._id = docid;
          for(var i in changes) {
            if(changes.hasOwnProperty(i)) makeChange(i);
          }
          self.documents.create(database, changes, function(response){
            if(callback) callback(response);
            else console.log(response);
          });
        }
        function makeChange(i) {
          response[i] = changes[i];
        }
      });
    },
    /* get
     * @params - string, string, callback
     * @returns - sends parsed JSON to callback
     * @description - gets a document from the database
     */
    get : function(database, id, callback){
      var path = database + "/" + id;
      self.get(path, {}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* remove
     * @params - string, string, callback
     * @returns - sends parsed JSON to callback
     * @description - attached the _deleted true flag, keeps the document
     *                around for replication concurrency, recommended way.
     *                Do not use this for bulk requests via loops, only
     *                works with around 100 requests this way, use removemany
     *                instead.
     */
    remove : function(database, id, callback){
      self.documents.get(database, id, function ifExists(response){
        var rev = response._rev;
        if(rev) {
          self.documents.create(database, {"_id": id ,"_rev": rev, "_deleted": true}, function(response){
            if(callback) callback(response);
            else console.log(response);
          });
        }
        else{
          if(callback) callback(response);
          else console.log(response);
        }
      });
    },
    /* destroy
     * @params - string, string, callback
     * @returns - sends parsed JSON to callback
     * @description - deletes a document completely, leaving only
     *                rev and id. Do not loop to delete many with
     *                this method, use removemany method instead.
     */
    destroy : function(database, id, callback){
      var path = database + "/" + id;
      self.get(path, {}, function ifExists(response){
        response = JSON.parse(response);
        var rev = response._rev;
        if(rev) {
          self.del(path, {"rev": rev}, function(response){
            response = JSON.parse(response);
            if(callback) callback(response);
            else console.log(response);
          });
        }
        else{
          if(callback) callback(response);
          else console.log(response);
        }
      });
    },
    /* many
     * @description - holds functions for bulk create,
     *                functions. Although this sits
     *                in the database segment of the
     *                api, it fits more nicely in the
     *                documents segment
     */
    many : {
      /* create
       * @params - string, array, callback
       * @returns - sends parsed JSON to callback
       * @description - bulk create documents by passing in
       *                an array containing many document objects
       */
      create : function(dbname, docs, callback) {
        var path = dbname + "/_bulk_docs";
        docs = {"docs": docs};
        self.post(path, docs, function(response){
          response = JSON.parse(response);
          if(callback) callback(response);
          else console.log(response);
        });
      },
      /* remove
       * @params - string, array, callback
       * @returns - sends parsed JSON to callback
       * @description - bulk remove documents by passing in
       *                an array of ids
       */
      remove : function(dbname, ids, callback) {
        var FINISHED = 'finished';
        var path = dbname + '/_bulk_docs';
        var emitter = new(require('events')).EventEmitter();
        var docs = [];

        emitter.on(FINISHED, function(docs){
          docs = {"docs": docs};
          self.post(path, docs, function(response){
            response = JSON.parse(response);
            if(callback) callback(response);
            else console.log(response);
          });
        });

        self.documents.many.get(dbname, ids, function(response){
          if(response.rows) {
            for(var i = 0, rows = response.rows.length; i < rows; i++) {
              toRemove(i);
            }
          }
          function toRemove(i){
            if(response.rows[i].id && response.rows[i].value.rev) {
              docs.push({"_id": response.rows[i].id, "_rev": response.rows[i].value.rev, "_deleted": true});
            }
            if(i == response.rows.length - 1) emitter.emit(FINISHED, docs);
          }
        });
      },
      /* get
       * @params - string, [array], callback
       * @returns - sends parsed JSON to callback
       * @description - Gets some or all the documents
       *                in a database, if an array of
       *                keys as an optional parameter
       *                is passed, only those documents
       *                are fetched.
       */
       get : function(dbname, /*keys,*/ callback) {
         var path = dbname + "/_all_docs";
         var keys = {};

         if(arguments.length == 3 || typeof arguments[1] == 'object' ) {
           keys = {"keys": arguments[1]};
           callback = arguments[2];
         }
         self.post(path, keys, function(response){
           response = JSON.parse(response);
           if(callback) callback(response);
           else console.log(response);
         });
       }
    }
    /* attachment
     * @params - @TODO
     * @returns - sends parsed JSON to callback
     * @description - add an attachment

    attachment : function() {
    //@TODO
    }*/
  };

  /* databases
   * @description - holds the methods listed under databases in the api,
   *                i.e. create, destroy, alldocs etc
   */
  this.databases = {
    /* create
     * @params - string, callback
     * @returns - sends parsed JSON to callback
     * @description - create a new database
     */
    create : function(dbname, callback) {
      self.run({"path": dbname, "method" :"PUT"}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* destroy
     * @params - string, callback
     * @returns - sends parsed JSON to callback
     * @description - remove a database
     */
    destroy : function(dbname, callback) {
      self.del(dbname, {}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* exists
     * @params - string, callback
     * @returns - sends true or false to callback
     * @description - check to see if a database exists
     * */
    exists : function(dbname, callback) {
      self.get(dbname, {}, function(response){
        var result;
        var error = JSON.parse(response).error;
        var exists = JSON.parse(response).db_name;
        if(error) result = false;
        else if (exists) result = true;
        if(callback){
          callback(result);
        }
        else{
          console.log(result);
        }
      });
    }
   };

  /* server
   * @description - holds the methods listed under server in the api,
   *                i.e. replication, log, databases etc
   */
  this.server = {
    /* replicate
     * @params - string, string, [boolean], callback
     * @returns - sends parsed JSON to callback
     * @description - Replicate a database, take a source, target, optional create_target flag and callback
     */
    replicate: function(source, target, /*[create_target]*/callback) {
      var create_target = false;
      var data;
      if(arguments.length == 4) {
        create_target = true;
        callback = arguments[3];
      }
      data = {"source": source, "target": target, "create_target": create_target};
      self.post("_replicate", data, function(response){
        response = JSON.parse(response);
        callback(response);
      });
    },
    /* stats
     * @params - [string, string], callback
     * @returns - sends parsed JSON to callback
     * @descriptions - returns server stats, takes an optional
     *                 query for a more defined search. The stat
     *                 codes can be any provided in couchdb:
     *                 http://docs.couchdb.org/en/latest/api/server/common.html#couchdb
     */
    stats : function(/*string, string*/callback) {
      var path = "_stats";
      var database;
      var query;
      if(arguments.length == 2) {
        throw new Error("stats need two string; a database, and a query, and a callback. Or just a callback.");
      }
      else if(arguments.length == 3) {
        database = arguments[0];
        query = arguments[1];
        path = path + "/" + database + "/" + query;
        callback = arguments[2];
      }
      self.get(path, {}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* restart
     * @params - callback
     * @returns - sends parsed JSON to callback
     * @description - restarts the server
     */
    restart : function(callback ){
      var path = "_restart";
      self.post(path, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* uuid
     * @params - integer, callback
     * @returns - sends parsed JSON to callback
     * @description - gets specified amount of uuids from the server
     */
    uuid : function(count, callback) {
      var data = {"count": count};
      self.get("_uuids", data, function(response){
        response = JSON.parse(response);
        if(callback)callback(response);
        else console.log(response);
      });
    },
    /* alldbs
     * @params - callback
     * @returns - sends parsed JSON to callback
     * @description - show all databases
     */
    alldbs : function(callback) {
      self.get("_all_dbs", {}, function(response) {
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    }
  };

  /* design
   * @description - JSON design document functions,
   *                name parameters refer to the design name
   */
  this.design = {
    /* create
    *  @params - string, string, object, callback
    *  @returns - sends parsed JSON to callback
    *  @description - create a new design document
    * */
    create : function createDesign(database, name, data, callback) {
      var path = database + "/_design/" + name;
      self.run({"path": path, "encoding": "binary", "data": data, "method": "PUT"}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },

    /* update
     * @params - string, string, object, callback
     * @returns - sends parsed JSON to callback
     * @description - overwrites a design document, if no revision number is provided, the latest is taken
     * */
    update : function updateDesign(database, name, data, callback) {
      var path = database + "/_design/" + name;
      self.get(path, {}, function(response){
        response = JSON.parse(response);
        if(response._rev) {
          if(!data._rev) data._rev = response._rev;
          self.run({"path": path, "encoding": "binary", "data": data, "method": "PUT"}, function(response){
            response = JSON.parse(response);
            if(callback) callback(response);
            else console.log(response);
          });
        }
        else {
          if(callback) callback(response);
          else console.log(response);
        }
      });
    },
    /* get
     * @params - string, string, callback
     * @returns - sends parsed JSON to callback
     * @description - get a design document
     */
    get : function getDesign(database, name, callback) {
      var path = database + "/_design/" + name;
      self.get(path, {}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* info
     * @params - string, string, callback
     * @returns - sends parsed JSON to callback
     * @description - get a design document info
     */
    info : function infoDesign(database, name, callback) {
      var path = database + "/_design/" + name + "/_info";
      self.get(path, {}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* copy
     * @params - string, string, string, callback
     * @returns - sends parsed JSON to callback
     * @description - copy a design document to a provided destination name
     */
    copy : function copyDesign(database, name, destination, callback) {
      var path = database + "/_design/" + name;
      self.copy(path, destination, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    }

  };

  /* view
   * @description - holds functions within for calling views
   * */
  this.view = {
    /* run
     * @params - string, string, object, callback
     * @returns - sends parsed JSON to callback
     * @description - runs a post on the view, can take in keys for data
     * */
    run : function runView(database, view, data, callback) {
      var path = database + "/_view/" + view;
      self.post(path, data, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    },
    /* get
     * @params - string, string, object, callback
     * @returns - sends parsed JSON to callback
     * @description - runs a get on the view
    * */
    get : function getView(database, design, view, callback) {
      var path = database + "/_design/" + design + "/_view/" + view;
      self.get(path, {}, function(response){
        response = JSON.parse(response);
        if(callback) callback(response);
        else console.log(response);
      });
    }
  };

  /* session
   * @description - session management functions
   */
  this.session = {
    /* get
     * @description - cookie management functions
     */
    get : function(name, password, callback) {
      var headers;
      var header;
      var headerobj = {};
      self.post("_session", {"name": name, "password": password, "_SHOWHEADERS": true}, function(response){
        if(response.headers) headers = response.headers;
        headers = headers["set-cookie"][0].split(";");
        for(var i = 0; i < headers.length; i++) {
          header = headers[i].split("=");
          headerobj[header[0].replace(" ", "")] = header[1];
        }
        if(callback) callback(headerobj.AuthSession);
        else console.log(headerobj.AuthSession);
      });
    }
  };

  /* Initialise couchlib */
  options = options || {};
  if(options.host) this.host = options.host;
  else this.host = "127.0.0.1"; // Default host to localhost

  if(options.port) this.port = options.port;
  else this.port = "5984"; // Default to port 5984

  if(options.user) this.user = options.user;
  if(options.password) this.password = options.password;
  if(options.cookies) self.session.get(this.user, this.password, function(cookie){
    if(cookie) self.cookie = cookie;
  });
};

