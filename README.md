couchlib
========
[![Build Status](https://travis-ci.org/nonapod/couchlib.png?branch=master)](https://travis-ci.org/nonapod/couchlib)
A couchdb interface for nodejs using the http module.
###Project Goals
The aim of this project is to create a base api that reflects the couchdb native http api as closely as possible, in a way that makes it intuitive for couch users. 

**Note This library is very new in development with lots of contunual changes, not everything is yet implemented.**

## Getting Started

1. Start by importing the library
    ```javascript
    var couchlib = require('./couchlib.js');
    ```
2. Create a new instance and pass in information
    ```javascript
    /* host defaults to localhost, port defaults to 5984 */
    couchlib = new couchlib({
      "host": "localhost", 
      "port": "5984", 
      "user": "admin", 
      "password": "password"});
    ```
3. The run function is couchlib's base request function, all other method functions rely on this, this is useful for customized queries
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

##Top level functions
###couchlib.version(callback(response))
* To get the CouchDB version:
```javascript
couchlib.version(callback(res));
```

##Requests
The following are request methods that are used throughout couchlib, they use the run function to form the request and return a JSON response from couchdb.
  * It is possible to include an object named $headers in the data, headers will be extracted from this optional definition and not be passed with the data.

###couchlib.get(path, [data], callback(response))
* A **GET** request (optional data is converted to a querystring)
```javascript
/* Optional data is converted to a querystring */
couchlib.get("path", /* [optional data] */, callback(res));
```

###couchlib.post(path, [data], callback(response))
* A **POST** request:
```javascript
couchlib.post("path", /*[optional data]*/, callback(res));
```

###couchlib.put(path, [data], callback(response))    
* A **PUT** request:
```javascript
couchlib.put("path", /*[optional data]*/, callback(res));
```

###couchlib.delete(path, [data], callback(response)) 
* A **DELETE** request, (automatically adds _deleted flag):
```javascript
couchlib.del("path", /*[optional data]*/, callback(res));
```

###couchlib.copy(source, target, [data], callback(response)) 
* A **COPY** request:
```javascript
couchlib.copy("path", "destination", callback(res));
```

##Databases - 
###couchlib.databases
Databases reflects the methods available in the databases segment of the native couchdb api i.e. purge, creating them, deleting tem etc. *All callback responses are parsed JSON*
###couchlib.databases.create(database_name, callback(response))
* To **create** a database:
```javascript
couchlib.databases.create("database name", callback(res));
```

###couchlib.databases.destroy(database_name, callback(response))
* To **delete** a database:
```javascript
couchlib.databases.destroy("database name", callback(res));
```

##Server - 
###couchlib.server
Server reflect the methods available in the server segment of the native couchdb api i.e. list databases, active tasks, replicate, restart etc

###couchlib.server.alldbs(callback(response))
* To show a list of databases
```javascript
couchlib.server.alldbs(callback(res));
```

###couchlib.server.uuid(count, callback(response))
* To get some uuids
```javascript
/*Set the count to how many uuids you want*/
var count = 1;
couchlib.server.uuids(count, callback(res));
```

###couchlib.server.replicate(source, target, [create_target] callback(response))
* To replicate databases
```javascript
/*Without create_target*/
couchlib.server.replicate("source database", "target database", callback(res));
/*With create target*/
couchlib.server.replicate("source database", "target database", true, callback(res));
```

##Documents - 
###couchlib.documents
Documents reflect the methods available in the documents segment of the native couchdb api i.e. creating/deleting documents and attachments. These methods should not be looped to manipulate multiple documents, instead use the documents.many methods for bulk functionality.
###couchlib.documents.create(database, document, callback(response))
* To create a document:
```javascript
/*Pass in a database name, a document object and a callback*/
couchlib.documents.create("exampledb", {/*Couch Document Goes Here*/}, callback(res));
```

##Documents - Many 
###couchlib.documents.many.create(database, documents, callback(response))
* To create many documents; note that all documents to create should be stored in an array and passed to this function:
```javascript
/*Pass in a database name, an array of document objects, and a callback*/
couchlib.documents.many.create("exampledb", [{ /* Document objects go in this array */ }], callback(res));
```

###couchlib.documents.many.remove(database, keys, callback(response))
* To remove many documents:
```javascript
/*Pass in a database name, an array of document id strings, and a callback*/
couchlib.documents.many.remove("exampledb", [ /* documents ids go in here as strings */], callback(res));
```

###couchlib.documents.many.get(database, [keys], callback(response))
* To gets many or all documents:
```javascript
/*Pass in a database name, an optional array of document id strings, and a callback. If no keys are passed, all documents are returned for this database*/
couchlib.documents.many.gets("exampledb", [ /* documents ids go in here as strings */], callback(res));
```

##Design - 
###couchlib.design    
Design reflect the methods available in the design segment of the native couchdb api i.e. creating/deleting design documents, show and list methods, views etc 
###couchlib.design.create(database, design_name, design_schema, callback(response))
* To create a new design document:
```javascript
couchlib.design.create("database", "design name", {/*Design Schema*/}, callback(response));
```

###couchlib.design.get(database, design_name, callback(response))
* To get a design doc
```javascript
couchlib.design.get("database", "design name", callback(response));
```

###couchlib.design.info(database, design_name, callback(response))
* To get a design doc's info
```javascript
couchlib.design.info("database", "design name", callback(response));
```

###couchlib.design.copy(database, design_name, target_name, callback(response))
* To copy a design doc
```javascript
couchlib.design.copy("database", "design name", "destination design name", callback(response));
```

##View - 
###couchlib.view    
I'm not sure whether or not to keep view separate from design, or to include it in design as that is where it sits in the native api. For now view functions are here

###couchlib.view.run(database, design_name, view_name callback(response))
* To run a view:
```javascript
couchlib.view.run("database", "design name", "view name", callback(response));
```

###couchlib.view.get(database, design_name, view_name callback(response))
* To get a view:
```javascript
couchlib.view.get("database", "design name", "view name", callback(response));
```


And that's all at the moment, I'll be changing things considerably the more I go along.
