/* ************************************************** *
 * ******************** Sends raw bunyan input into a MongoDB.
 * ************************************************** */

var mongoose = require('mongoose');

/* ************************************************** *
 * ******************** Constructor
 * ************************************************** */

var MongoStream = function(filter) {
  this.filter = filter;
  this.writable = true;
};

/* ************************************************** *
 * ******************** Methods
 * ************************************************** */

/**
 * Implements the stream write interface to be used with a logger.
 * @param {object} obj - A log record.
 */
MongoStream.prototype.write = function(obj) {
  // Only log if mongoose is connected.
  if(mongoose.connection.readyState) {
    var Log = mongoose.model('Log');
    if(this.filter) {
        this.filter(obj, function(err, filteredObj) {
          if(err) {
            console.log('Failed to filter obj for logging to MongoDB.', err);
          } else {
            Log.record(filteredObj)
          }
        });
    } else {
      Log.record(obj);
    }
  }
};

/**
 * Filters secret information from being logged.
 * @param {object} obj - Object that needs to be filtered.
 * @param callback - Async callback.
 * @returns {*}
 */
MongoStream.passwordFilter = function(obj, callback) {
  // If the record stores the body of a request. We need to filter any passwords.
  if(obj.body) {
    var filters = ['password', 'pass', 'security', 'securityAnswer'];
    for(var prop in obj.body) {
      if(obj.body.hasOwnProperty(prop)) {
        if(filters.indexOf(prop.toLowerCase()) > -1) {
          obj.body[prop] = '*'
        }
      }
    }
    return callback(undefined, obj);
  } else {
    return callback(undefined, obj);
  }
};

/* ************************************************** *
 * ******************** Exports
 * ************************************************** */

exports = module.exports = MongoStream;
exports = MongoStream;