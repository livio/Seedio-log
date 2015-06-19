/* ************************************************** *
 * ******************** Constructor
 * ************************************************** */

var MongoStream = function(options) {
  if(!options) { options = {}}
  if(!options.mongoose) {
    throw new error ('A mongoose instance must be supplied in the options');
  }

  this.mongoose = options.mongoose;
  this.collectionName = options.collectionName || 'Log';
  this.filter = options.filter;
  this.writable = true;

  init(this.mongoose, this.collectionName);
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
  if(this.mongoose.connection.readyState) {
    var Log = this.mongoose.model(this.getCollectionName());
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
  } else {
    console.log('Failed to record log to Database because the MongoDB connection is not in the ready state.');
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
 * ******************** Private functions
 * ************************************************** */

/**
 * Init the mongoose collection.
 * @param mongoose is an instance of mongoose.
 * @param {string} collectionName is the name of the collection that will be used in MongoDB
 */
function init(mongoose, collectionName) {
  if(!mongoose || !collectionName) {
    throw new Error('An instance of mongoose and a collectionName is required to initialize the collection');
  }

  // Make sure the schema does not already exists otherwise we will get an exception.
  if(!mongoose.modelSchemas[collectionName]) {
    mongoose.model(collectionName, new mongoose.Schema({}, {strict: false}));
  }
}

/* ************************************************** *
 * ******************** Exports
 * ************************************************** */

module.exports = MongoStream;