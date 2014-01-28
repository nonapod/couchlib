couchlib
========

A couchdb interface for nodejs using the http module.

**This library is starting to take better shape, although it's still a few days in its infancy, things are starting to lay out much nicer. Originally I was planning to make a couchdb connector for a new site/app that I'm making, however now I'm enjoying it so much I'm going to try to implement the entire couch http api here, and then make a sails.js connector, just because.**

Not everything is hooked in so far, and things are changing a lot, here's what can be done at the moment, bare in mind that everything is being sifted out into objects with related functions, so it looks more like the original api. All tests are being done using Mocha:

1. Import the library
    ```javascript
    var couchlib = require('./couchlib.js');
    ```
2. Grab a new instance and pass in information:
    ```javascript
    couchlib = new couchlib({
      "host": "localhost", 
      "port": "5984", 
      "user": "admin", 
      "password": "password"});
    ```
3. Here are the currently implemented method requests, in all instances, if no callback is required, the response is logged to the console, good for testing with REPL:
    * A run request, pretty much everything uses this, use this for more customized requests when you want to add headers and lots of options etc:
    ```javascript
    /* Options Example */
    var options = {
    		"host": "www.example.com",
    		"port": "80",
    		"method": "POST",
    		"path": "/index?action=1223&php=off",
    		"headers": {"Header Name": "Header Option"}
    		"auth" : "user:password",
            "data": {"name": "some data in here"}
    }
    couchlib.run(options, callback(res));
    ```    

    * A get request (optional data is converted to a querystring):
    ```javascript
    couchlib.get("path", /* [optional data] */, callback(res));
    ```
    
    * A post request:
    ```javascript
    couchlib.post("path", /*[optional data]*/, callback(res));
    ```
    
    * A put request:
    ```javascript
    couchlib.put("path", /*[optional data]*/, callback(res));
    ```
    
    * A delete request, (automatically adds _deleted flag):
    ```javascript
    couchlib.del("path", /*[optional data]*/, callback(res));
    ```
    
    * A copy request:
    ```javascript
    couchlib.copy("path", "destination", callback(res));
    ```

4. Here are the working methods, callbacks are optional, if none is provided, they are outputted to the console. All callback responses are parsed JSON:
    * To create a database:
    ```javascript
    couchlib.create("database name", callback(res));
    ```

    * To delete a database:
    ```javascript
    couchlib.destroy("database name", callback(res));
    ```
    
    * To get the CouchDB version:
    ```javascript
    couchlib.version(callback(res));
    ```
    
    * To show a list of databases:
    ```javascript
    couchlib.databases(callback(res));
    ```
    
    * To get some uuids:
    ```javascript
    /*Pass in a count of 1 or more and an optional callback, no callback will log the uuids to the console*/
    var count = 1;
    couchlib.uuids(count, callback(res));
    ```
    
    * To create a document:
    ```javascript
    /*Pass in a database name, a document object and a callback*/
    couchlib.document("exampledb", {/*Couch Document Goes Here*/}, callback(res));
    ```
    
    * To replicate databases
    ```javascript
    /*Pass in a source, target, [create_target], callback*/
    /*Without create_target*/
    couchlib.replicate("source database", "target database", callback(res));
    /*With create target*/
    couchlib.replicate("source database", "target database", true, callback(res));
    ```
    
5. Design methods, current design methods available. Note that loading design schemas from files isn't yet available, but in the works. All responses are parsed JSON:
    * To create a new design document:
    ```javascript
    couchlib.design.create("database", "design name", {/*Design Schema*/}, callback(res));
    ```

    * To update a design doc (Overwrites the current design doc):
    ```javascript
    /*You can provide a _rev number in the design schema if you want, if not it will grab the latest and overwrite it*/
    couchlib.design.update("database", "design name", {/*Design Schema*/}, callback(res));
    ```
    
    * To get a design doc
    ```javascript
    couchlib.design.get("database", "design name", callback(res));
    ```
    
    * To get a design doc's info
    ```javascript
    couchlib.design.info("database", "design name", callback(res));
    ```
    
    * To copy a design doc
    ```javascript
    couchlib.design.copy("database", "design name", "destination design name", callback(res));
    ```
    
6. View methods, this will be moved into the Design methods eventually to stay closer to the couchdb api:
    * To run a view:
    ```javascript
    couchlib.view.get("database", "design name", "view name", callback(res));
    ```


And that's all at the moment, I'll be changing things considerably the more I go along.
