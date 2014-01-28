/**
 * Unit testing with Mocha
 * Author: Leslie.A.Cordell 2014
 */
var couchlib = require('./couchlib');
var assert = require('assert');

/* Quick typecheck function */
Object.prototype.typecheck = function() {
  var result = Object.prototype.toString.call(this);
  result = result.replace(/[\]\[]/g, "");
  result = result.split(" ")[1];
  return result;
};


describe('couchlib', function(){

  couchlib = new couchlib({"user": "admin", "password": "7oZu37d0CEt$"});

  /* couchlib.version() */
  describe('.version()', function(){
    it('should return the version number', function(done){
      couchlib.version(function showVersion(result) {
        assert.equal('1.5.0', result);
        done();
      }); // End showVersion
    }); // End it
  }); // End .version()

  /* couchlib.databases() */
  describe('.databases()', function(){
    it('should return an array of databases', function(done){
      couchlib.databases(function listDatabases(result) {
        assert.equal('Array', result.typecheck());
        done();
      }); // End listDatabases
    }); // End it
  }); // End .databases()

  /* couchlib.create() */
  describe('.create() then .destroy()', function(){
    it('should create a new database, try to duplicate and then destroy', function(done){
      var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
      /* first create */
      couchlib.create(id, function createFirst(response){
        assert.equal(true, response.ok);
        /* try to create duplicate*/
        couchlib.create(id, function createDuplicate(response){
          /* should fail with file_exists */
          assert.equal('file_exists', response.error);
          /* destroy our original database */
          couchlib.destroy(id, function destroyFirst(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            done();
          }); // End destroyFirst
        }); // End create duplicate
      }); // End createFirst
    }); // End it
  }); // End .create()

  /* couchlib.destroy() */
  describe(".destroy()", function(){
    var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    it('should try to destroy a non existent database and then return a "not_found" error ', function (done){
      couchlib.destroy(id, function destroyNonExistent(response){
        assert.equal("not_found", response.error);
        done();
      }); // End destroyNonExistent
    }); // End it
  }); // End .destroy()

  /* couchlib.document() */
  describe(".document()", function(){
    var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var document = {"name": "test", "age": 1234, "loggedin": true};
    it('should create a new database, a new document, return ok, then destroy the database', function(done){
      /* create a random test database */
      couchlib.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create a new document */
        couchlib.document(id, document, function createNewDocument(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* destroy the database */
          couchlib.destroy(id, function destroyDatabase(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            done();
          }); // End destroyDatabase
        }); // End createNewDocument
      }); // End createDatabase
    }); // End it
  }); // End .document()

  /* couchlib.replicate() */
  describe(".replicate() with create_target == true", function(){
    var target = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var source = ("test" + Math.floor((Math.random()*200)+(Math.random()*200)));
    var document = {"name": "test", "age": 1234, "loggedin": true};
    it("should create a database, a document, replicate from target to source and return success, then destroy the databases", function(done){
      /* create the source */
      couchlib.create(source, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* create a new document */
        couchlib.document(source, document, function createNewDocument(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          /* Start Replicating */
          couchlib.replicate(source, target, true, function startReplication(response){
            /* should return {"ok": true} */
            assert.equal(true, response.ok);
            /* destroy the source database */
            couchlib.destroy(source, function destroySource(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              /* destroy the target database */
              couchlib.destroy(target, function destroyTarget(response){
                /* should return {"ok": true} */
                assert.equal(true, response.ok);
                done();
              }); // End destroyTarget
            }); // End destroySource
          }); // End startReplication
        }); // End createNewDocument
      }); // End createDatabase
    }); // End it
  }); // End .replicate()

  /* couchlib.design.create() */
  describe('.design.create()', function(){
    var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var name = ("view" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, try to duplicate, fail, then destroy the database', function(done){
      /* create a new database */
      couchlib.create(id, function createDatabase(response){
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
            couchlib.destroy(id, function destroyDatabase(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              done();
            }); // End destroyDatabase
          }); // End duplicateDesign
        }); // End createDesign
      }); // End createDatabase
    }); // End it
  }); // End .design.create()

  /* couchlib.design.update() */
  describe('.design.update()', function(){
    var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var name = ("view" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, try to update, then destroy the database', function(done){
      /* create a new database */
      couchlib.create(id, function createDatabase(response){
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
            couchlib.destroy(id, function destroyDatabase(response){
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
    var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var name = ("view" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, get it, then destroy the database', function(done){
      /* create a new database */
      couchlib.create(id, function createDatabase(response){
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
            couchlib.destroy(id, function destroyDatabase(response){
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
    var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var name = ("view" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, get the info, then destroy the database', function(done){
      /* create a new database */
      couchlib.create(id, function createDatabase(response){
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
            couchlib.destroy(id, function destroyDatabase(response){
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
    var id = ("test" + Math.floor((Math.random()*1000)+(Math.random()*1000)));
    var name = ("design" + Math.floor((Math.random()*1000)+(Math.random()*1000)));
    var destination = ("destination" + Math.floor((Math.random()*1000)+(Math.random()*1000)));
    var design = {
      "views": {
        "testview": {
          "map": "function(doc){ emit(doc._id, doc._rev)}"
        }
      }
    };
    it('should create a database, create a design document, duplicate to a destination, then destroy the database', function(done){
      /* create a new database */
      couchlib.create(id, function createDatabase(response){
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
            couchlib.destroy(id, function destroyDatabase(response){
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
    var id = ("test" + Math.floor((Math.random()*100)+(Math.random()*100)));
    var design_name = ("designname" + Math.floor((Math.random()*100)+(Math.random()*100)));
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
      couchlib.create(id, function createDatabase(response){
        /* should return {"ok": true} */
        assert.equal(true, response.ok);
        /* Create design document */
        couchlib.design.create(id, design_name, design, function createDesign(response){
          /* should return {"ok": true} */
          assert.equal(true, response.ok);
          couchlib.view.get(id, design_name, "testview", function getView(response){
            /* should return {"ok": true} */
            assert.equal(true, "total_rows" in response);
            couchlib.destroy(id, function destroyDatabase(response){
              /* should return {"ok": true} */
              assert.equal(true, response.ok);
              done();
            }); // End destroyDatabase
          }); // End getView
        }); // End createDesign
      }); // End createDatabase
    }); // End it
  }); // End describe



}); // End couchlib
