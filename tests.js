/**
 * Unit testing with Mocha
 * Author: Leslie.A.Cordell 2014
 */
var couchlib = require('./couchlib');
var assert = require('assert');
var events = require('events');
var emitter = new events.EventEmitter();

/* Quick typecheck function */
Object.prototype.typecheck = function() {
  var result = Object.prototype.toString.call(this);
  result = result.replace(/[\]\[]/g, "");
  result = result.split(" ")[1];
  return result;
};

/* Make it synchronous */

describe('couchlib', function(){

  couchlib = new couchlib();

  /* couchlib.version() */
  describe('.version()', function(){
    it('should return the version number', function(done){
      couchlib.version(function showVersion(result) {
        var validVersion = result.match(/\d+\.\d+\.\d+/i);
        assert.equal("Array", validVersion.typecheck());
        done();
      }); // End showVersion
    }); // End it
  }); // End .version()

  /* couchlib.server.alldbs() */
  describe('.server.alldbs()', function(){
    it('should return an array of databases', function(done){
      couchlib.server.alldbs(function listDatabases(result) {
        assert.equal('Array', result.typecheck());
        done();
      }); // End listDatabases
    }); // End it
  }); // End .server.alldbs()

  /* couchlib.databases.create() */
  describe('.databases.create() then .databases.destroy()', function(){
    it('should create a new database, try to duplicate and then destroy', function(done){
      var id = "test" + Math.random().toString(36).substring(2);
      /* first create */
      couchlib.databases.create(id, function createFirst(response){
        assert.equal(true, response.ok);
        /* try to create duplicate*/
        couchlib.databases.create(id, function createDuplicate(response){
          /* should fail with file_exists */
          assert.equal('file_exists', response.error);
          /* destroy our original database */
          couchlib.databases.destroy(id, function destroyFirst(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            done();
          }); // End destroyFirst
        }); // End create duplicate
      }); // End createFirst
    }); // End it
  }); // End .databases.create()

  /* couchlib.databases.destroy() */
  describe(".databases.destroy()", function(){
    var id = "test" + Math.random().toString(36).substring(2);
    it('should try to destroy a non existent database and then return a "not_found" error ', function (done){
      couchlib.databases.destroy(id, function destroyNonExistent(response){
        assert.equal("not_found", response.error);
        done();
      }); // End destroyNonExistent
    }); // End it
  }); // End .databases.destroy()

  /* couchlib.documents.create() */
  describe(".documents.create()", function(){
    var id = "test" + Math.random().toString(36).substring(2);
    var document = {"name": "test", "age": 1234, "loggedin": true};
    it('should create a new database, a new document, return ok, then destroy the database', function(done){
      /* create a random test database */
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create a new document */
        couchlib.documents.create(id, document, function createNewDocument(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* destroy the database */
          couchlib.databases.destroy(id, function destroyDatabase(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            done();
          }); // End destroyDatabase
        }); // End createNewDocument
      }); // End createDatabase
    }); // End it
  }); // End .documents.create()

  /* couchlib.documents.destroy() */
  describe(".documents.destroy()", function(){
    it('should create a database, create 3 documents, destroy them, and then delete the database.', function(done){
      var COMPLETED = 0;
      var COUNT = 3;
      var INSERTED = 'inserted';
      var DELETED = 'deleted';
      var DESTROYED = 0;
      var DOCS = [];
      var DBNAME = "test" + Math.random().toString(36).substring(2);
      /* Whenever a document is created, increment the inserted variable*/
      emitter.on(INSERTED, function(docid){
        COMPLETED ++;
        DOCS.push(docid);
        if(COMPLETED == COUNT) {
          destroyDocuments(DOCS);
        }
      });
      /* Whenever a document is deleted, increment the deleted variable */
      emitter.on(DELETED, function(){
        DESTROYED++;
        if(DESTROYED == COUNT) {
          destroyDatabase(DBNAME);
        }
      });

      /* create a random test database */
      couchlib.databases.create(DBNAME, function createDatabase(response){
        var document = {"name": "test", "age": 1234, "loggedin": true};
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* Look 100 times and create our documents */
        for(var i = 0; i <= COUNT; i++) {
          couchlib.documents.create(DBNAME, document, function createDocument(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            /* should also return an id number */
            assert.equal(true, "id" in response);
            emitter.emit(INSERTED, response.id);
          }); // End .documents.create
        } // End for
      }); // End createDatabase

      /* destroy all the documents */
      function destroyDocuments(docs) {
        for(var i = 0, doc; doc = docs[i], i < docs.length; i++) {
          (function destroyDocument(doc){
            couchlib.documents.remove(DBNAME, doc, function(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              emitter.emit(DELETED);
            }); // End .documents.destroy()
          })(doc);
        } // End for
      } // End destroyDocuments

      /* destroy the database */
      function destroyDatabase(DBNAME){
        couchlib.databases.destroy(DBNAME, function destroyDatabase(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          done();
        }); // End .databases.destroy
      } // End destroyDatabase

    }); // End it
  }); // End .documents.destroy()

  /* couchlib.documents.many.create() */
  describe(".documents.many.create() use all .many function to create many documents and delete them", function(){
    it("should create a database, create many documents, get them all, delete them all then delete the database", function(done){
      var COUNT = 10000;
      var COMPLETE = 'completed';
      var READY = 'ready';
      var id = "test" + Math.random().toString(36).substring(2);
      var docs = [];
      var removedocs = [];
      this.timeout(100000);
      /* Once we've prepared our delete, delete the docs, then the database */
      emitter.on(READY, function(docs){
        couchlib.documents.many.remove(id, docs, function removeMany(response){
          /* Response should be a length greater than 0 */
          assert.equal(true, response.length > 0);
          couchlib.databases.destroy(id, function destroyDatabase(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            done();
          }); // End destroyDatabase
        }); // End removeMany
      }); // End READY
      /* Once we have created docs, prepare to delete them */
      emitter.on(COMPLETE, function prepareDelete(docs){
        for(var i = 0; i < docs.length; i++) {
          (function(i){
            if(docs[i]["id"]) {
              removedocs.push(docs[i]["id"])
            }
            if(i == docs.length - 1) {
              emitter.emit(READY, removedocs);
            }
          })(i);
        }
      }); // End prepareDelete
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* Create many documents */
        for(var i = 0; i < COUNT; i++){
          docs.push({"name": "test", "age": 111});
        }
        couchlib.documents.many.create(id, docs, function createMany(response){
          assert.equal(true, response.length > 0);
          emitter.emit(COMPLETE, response);
        }); // End createMany
      }); // End createDatabase
    }); // End it
  }); // End documents.many.create()

  /* couchlib.server.replicate() */
  describe(".server.replicate() with create_target == true", function(){
    var target = "test" + Math.random().toString(36).substring(2);
    var source = "test" + Math.random().toString(36).substring(2);
    var document = {"name": "test", "age": 1234, "loggedin": true};
    it("should create a database, a document, replicate from target to source and return success, then destroy the databases", function(done){
      /* create the source */
      couchlib.databases.create(source, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create a new document */
        couchlib.documents.create(source, document, function createNewDocument(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* Start Replicating */
          couchlib.server.replicate(source, target, true, function startReplication(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            /* destroy the source database */
            couchlib.databases.destroy(source, function destroySource(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              /* destroy the target database */
              couchlib.databases.destroy(target, function destroyTarget(response){
                /* should return {"ok": true} */
                assert.equal(true, response.ok);
                done();
              }); // End destroyTarget
            }); // End destroySource
          }); // End startReplication
        }); // End createNewDocument
      }); // End createDatabase
    }); // End it
  }); // End .server.replicate()

  /* couchlib.server.stats() */
  describe('.server.stats()', function(){
    it('should create a database, run a few stats queries and then delete itself', function(done){
      var id = "test" + Math.random().toString(36).substring(2);
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* See how many GET requests there have been */
        couchlib.server.stats(id, "GET", function serverStats(response){
          /* Should return an object with the GET requests in the database */
          assert.equal(true, "GET" in response[id]);
          couchlib.databases.destroy(id, function destroyDatabase(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            done();
          }); // End destroyDatabase
        }); // End serverStats
      }); // End createDatabase
    }); // End it
  }); // End .server.stats()

  /* couchlib.design.create() */
  describe('.design.create()', function(){
    var id = "test" + Math.random().toString(36).substring(2);
    var name = "test" + Math.random().toString(36).substring(2);
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should check database exists, create it, create a design document, try to duplicate, fail, then destroy the database', function(done){
      couchlib.databases.exists(id, function checkExists(response){
        /* database should not exists */
        assert.equal(false, response);
        /* create a new database */
        couchlib.databases.create(id, function createDatabase(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* create the design */
          couchlib.design.create(id, name, design, function createDesign(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            /* Try to duplicate, should return Document update conflict */
            couchlib.design.create(id, name, design, function duplicateDesign(response){
              /* should return {"error": "conflict"} */
              assert.equal("conflict", response.error);
              couchlib.databases.destroy(id, function destroyDatabase(response){
                /* should return {"ok": true} */
                assert.equal(true, response.ok);
                done();
              }); // End destroyDatabase
            }); // End duplicateDesign
          }); // End createDesign
        }); // End createDatabase
      }); // End checkExists

    }); // End it
  }); // End .design.create()

  /* couchlib.design.update() */
  describe('.design.update()', function(){
    var id = "test" + Math.random().toString(36).substring(2);
    var name = "test" + Math.random().toString(36).substring(2);
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, try to update, then destroy the database', function(done){
      /* create a new database */
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create the design */
        couchlib.design.create(id, name, design, function createDesign(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* Try to update the document */
          couchlib.design.update(id, name, design, function updateDesign(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            couchlib.databases.destroy(id, function destroyDatabase(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              done();
            }); // End destroyDatabase
          }); // End updateDesign
        }); // End createDesign
      }); // End createDatabase
    }); // End it
  }); // End .design.update()

  /* couchlib.design.get() */
  describe('.design.get()', function(){
    var id = "test" + Math.random().toString(36).substring(2);
    var name = "test" + Math.random().toString(36).substring(2);
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, get it, then destroy the database', function(done){
      /* create a new database */
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create the design */
        couchlib.design.create(id, name, design, function createDesign(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* Try to get the new design document */
          couchlib.design.get(id, name, function getDesign(response){
            /* should return object containing new revision number */
            assert.equal(true, "_rev" in response);
            couchlib.databases.destroy(id, function destroyDatabase(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              done();
            }); // End destroyDatabase
          }); // End getDesign
        }); // End createDesign
      }); // End createDatabase
    }); // End it
  }); // End .design.get()

  /* couchlib.design.info() */
  describe('.design.info()', function(){
    var id = "test" + Math.random().toString(36).substring(2);
    var name = "test" + Math.random().toString(36).substring(2);
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, get the info, then destroy the database', function(done){
      /* create a new database */
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create the design */
        couchlib.design.create(id, name, design, function createDesign(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* Try to get the new design document info */
          couchlib.design.info(id, name, function getDesignInfo(response){
            /* should return object containing a key/value pair identified by name */
            assert.equal(true, "name" in response);
            couchlib.databases.destroy(id, function destroyDatabase(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              done();
            }); // End destroyDatabase
          }); // End getDesignInfo
        }); // End createDesign
      }); // End createDatabase
    }); // End it
  }); // End .design.info()

  /* couchlib.design.copy() */
  describe('.design.copy()', function(){
    var id = "test" + Math.random().toString(36).substring(2);
    var name = "test" + Math.random().toString(36).substring(2);
    var destination = "test" + Math.random().toString(36).substring(2);
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, duplicate to a destination, then destroy the database', function(done){
      /* create a new database */
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create the design */
        couchlib.design.create(id, name, design, function createDesign(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* Try to copy the design doc to a new destination */
          couchlib.design.copy(id, name, destination, function copyDesign(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            couchlib.databases.destroy(id, function destroyDatabase(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              done();
            }); // End destroyDatabase
          }); // End copyDesign
        }); // End createDesign
      }); // End createDatabase
    }); // End it
  }); // End .design.copy()

  /* couchlib.view.get() */
  describe(".view.get()", function(){
    var id = "test" + Math.random().toString(36).substring(2);
    var design_name = "test" + Math.random().toString(36).substring(2);
    var design = {
      "_id": "testing",
      "language": "javascript",
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it("should create a new database, a design doc with a view, get the view, then delete the database", function(done){
      /* create the blank database */
      couchlib.databases.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* Create design document */
        couchlib.design.create(id, design_name, design, function createDesign(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          couchlib.view.get(id, design_name, "testview", function getView(response){
            /* should return {"ok": true} */
            assert.equal(true, "total_rows" in response);
            couchlib.databases.destroy(id, function destroyDatabase(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              done();
            }); // End destroyDatabase
          }); // End getView
        }); // End createDesign
      }); // End createDatabase
    }); // End it
  }); // End describe

  /* This test should remain at the end */
  /* couchlib.server.restart() */
  describe('.server.restart()', function(){
    it('should restart the server', function(done) {
      couchlib.server.restart(function restartServer(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        done();
      }); // End restartServer
    }); // End it
  }); // End .server.restart()

}); // End couchlib
