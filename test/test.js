var Log = require('../index');
var assert = require('assert');

function captureStream(stream){
  var oldWrite = stream.write;
  var buf = '';
  stream.write = function(chunk, encoding, callback){
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  };

  return {
    unhook: function unhook(){
      stream.write = oldWrite;
    },
    captured: function(){
      return buf;
    }
  };
}

describe("seedio-log", function() {

  var hooker;
  beforeEach(function() {
    hooker = captureStream(process.stdout);
  });

  afterEach(function() {
    hooker.unhook();
  });

  describe('Initialization', function() {
    it('Should create a log object and a request log object', function(done) {
      var testLog = new Log();

      assert(testLog.log);
      assert(testLog.requestLog);

      done();
    });

    it('Should initialize all parameters to default values when the options parameter is not defined', function(done) {
      var testLog = new Log();

      assert.equal(testLog.debug, true);
      assert.equal(testLog.trace, false);
      assert.equal(testLog.error, true);
      assert.equal(testLog.name, 'Log');
      assert.equal(testLog.databaseLog, false);

      done();
    });

    it('Should initialize all parameters to the supplied options parameter', function(done) {
      var options = {
        debug: false,
        trace: true,
        error: false,
        name: 'Test Logger'
      };

      var testLog = new Log(options);

      assert.equal(testLog.debug, options.debug);
      assert.equal(testLog.trace, options.trace);
      assert.equal(testLog.error, options.error);
      assert.equal(testLog.name, options.name);

      done();
    });

    it('Should throw an error if database logging is enabled but no mongoose instance was supplied in the options', function(done) {
      var options = {
        databaseLog: true
      };

      assert.throws(function() {
        var testLog = new Log(options);
      });

      done();
    });

  });
});