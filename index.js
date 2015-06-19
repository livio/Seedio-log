/* ************************************************** *
 * ******************** Constructor
 * ************************************************** */

var Log = function (options) {
  var bunyan = require('bunyan'),
      MongoStream = require('./libs/mongoStream'),
      PrettySteam = require('./libs/prettyStream');

  if(!options) { options = {} }

  this.debug = options.debug || true;
  this.trace = options.trace || false;
  this.error = options.error || true;
  this.name = options.name || 'Log';
  this.databaseLog = options.databaseLog || false;

  var loggingStreams = [
    {
      type: 'raw',
      level: 'trace',
      stream: new PrettySteam()
    }
  ];
  if(this.databaseLog) {
    if(!options.mongoose) {
      throw new Error('An instance of mongoose is required to enabled database logging')
    }

    loggingStreams.push( {
      type: 'raw',
      level: 'info',
      stream: new MongoStream({mongoose: options.mongoose})
    })
  }

  this.log = bunyan.createLogger({
    name: this.name,
    serializers: bunyan.stdSerializers,
    streams: loggingStreams});

  this.requestLog = require('express-bunyan-logger')({
    name: this.name + ' Requests',
    serializers: bunyan.stdSerializers,
    streams: loggingStreams});
};

/* ************************************************** *
 * ******************** Methods
 * ************************************************** */

Log.prototype.requestLogger = function() {
  return this.requestLog;
};

Log.prototype.i = function() {
  this.log.info.apply(this.log, arguments);
};

Log.prototype.d = function() {
  if(this.debug) {
    this.log.debug.apply(this.log, arguments);
  }
};

Log.prototype.t = function() {
  if(this.trace) {
    this.log.trace.apply(this.log, arguments);
  }
};

Log.prototype.e = function() {
  if(this.error) {
    this.log.error.apply(this.log, arguments);
  }
};

Log.prototype.w = function() {
  if(this.error) {
    this.log.warn.apply(this.log, arguments);
  }
};

/* ************************************************** *
 * ******************** Exports
 * ************************************************** */

module.exports = Log;