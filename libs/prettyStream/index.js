/* ************************************************** *
 * ******************** Pretty prints a bunyan stream (now with 100% more color) using console.log
 * ************************************************** */

var colors = require('colors');

colors.setTheme({
  success: 'green',
  info: 'cyan',
  trace: 'gray',
  debug: 'magenta',
  warn: 'yellow',
  error: 'red'
});

// Logging levels. These correlate directly with how the bunyan logging library defines its logging levels.
var levels = {
  10: createLevel('TRACE', 10, 'trace'),
  20: createLevel('DEBUG', 20, 'debug'),
  30: createLevel('INFO', 30, 'info'),
  40: createLevel('WARN', 40, 'warn'),
  50: createLevel('ERROR', 50, 'error'),
  60: createLevel('FATAL', 60, 'error')
};

var PrettyStream = function() {
  this.writable = true;
};

PrettyStream.prototype.write = function(obj) {
  var level = levels[obj.level];

  // Handle pretty printing of HTTP request logs.
  if(obj.req) {
    var color;
    if(obj.res.statusCode < 300) {
      color = 'success';
    } else if (obj.res.statusCode < 400) {
      color = 'warn';
    } else {
      color = 'error';
    }

    console.log('[%s] ' + colors[color]('%s') + ' %s %s %s ms', obj.time.toUTCString(), obj.res.statusCode, obj.req.method, obj.req.url, obj['response-time'])
  } else {
    if(obj.err) {
      // Log errors and their stacks.
      console.log('[%s] ' + colors[level.color]('[%s]') + ': ' + colors[level.color]('%s') + '\n' + colors[level.color]('%s'),
        obj.time.toUTCString(),
        level.name,
        obj.err.message,
        obj.err.stack);
    } else {
      // Log standard message.
      console.log('[%s] ' + colors[level.color]('[%s]') + ': ' + colors[level.color]('%s'),
        obj.time.toUTCString(),
        level.name,
        obj.msg);
    }
  }
};

/* ************************************************** *
 * ******************** Helper Functions
 * ************************************************** */

/**
 * Creates a new logging level configuration object.
 * @param {string} name - Friendly name of the logging level.
 * @param {number} index - The logging level index.
 * @param {string} color - Name of color to use.
 * @returns {{name: *, index: *, color: *}}
 */
function createLevel(name, index, color) {
  return {name: name, index: index, color: color}
}

/* ************************************************** *
 * ******************** Exports
 * ************************************************** */

exports = module.exports = PrettyStream;
exports = PrettyStream;
