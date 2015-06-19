/* ************************************************** *
 * ******************** Sends raw bunyan input into a MongoDB.
 * ************************************************** */

var mongoose = require('mongoose');

/* ************************************************** *
 * ******************** Constructor
 * ************************************************** */

var MongoStream = function(options) {
  if(!options) { options = {}}
  this.collectionName = options.collectionName || 'Log';
  initCollection(this.collectionName);
  this.filter = options.filter;
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
    var Log = mongoose.model(this.getCollectionName());
    if(this.filter) {
        this.filter(obj, function(err, filteredObj) {
          if(err) {
            console.log('Failed to filter obj for logging to MongoDB.', err);
          } else {
            new Log(filteredObj).save(function(err) {
              if(err) {
                console.log('Failed record log in mongoose.\n%s', err)
              }
            });
          }
        });
    } else {
      new Log(obj).save(function(err) {
        if(err) {
          console.log('Failed record log in mongoose.\n%s', err)
        }
      });
    }
  }
};

MongoStream.prototype.getCollectionName = function() {
  return this.collectionName;
};

/**
 * Filters secret information from a requests body from being logged.
 * @param {Array} propertyNames is an array of strings that contains the property names to be filtered.
 * @param {object} obj - Object that needs to be filtered.
 * @param callback - Async callback.
 * @returns {*}
 */
MongoStream.propertyFilter = function(propertyNames, obj, callback) {
  // If the record stores the body of a request. We need to filter any passwords.
  if(obj.body) {
    for (var prop in obj.body) {
      if (obj.body.hasOwnProperty(prop)) {
        if (propertyNames.indexOf(prop.toLowerCase()) > -1) {
          obj.body[prop] = '*'
        }
      }
    }
  }

  return callback(undefined, obj);
};

/* ************************************************** *
 * ******************** Helper Functions
 * ************************************************** */

/**
 * Initializes the mongoose collection that will be used for logging.
 * @param {string} collectionName The name of the mongoose collection.
 */
function initCollection(collectionName) {
  mongoose.model(collectionName, new mongoose.Schema({}, {strict: false}));
}

/* ************************************************** *
 * ******************** Exports
 * ************************************************** */

exports = module.exports = MongoStream;
exports = MongoStream;