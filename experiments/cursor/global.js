'use strict';
const Global = {};
const Console = window.console = (function(){
  var inputs = [];
  var cursor = 0;
  var _console = console;
  var stdout = stddbg = console.log;
  var stderr = console.error;
  var stdnfo = console.info;
  var registry = {
    all: function(search) {
      search = search || '';
      Object.keys(registry).filter(cmd => {
        return ~cmd.indexOf(search);
      }).sort((a, b) => b - a).forEach(cmd => Console.log(cmd));
    },
    help: function(cmd) {
      cmd = cmd || 'help';
      if (cmd in registry && registry[cmd].help) {
        return Console.info(registry[cmd].help);
      }
      return Console.info('no help text found:', cmd);
    },
    debug: function(level) {
      Global.debug = parse('int', level, 0);
    }
  };
  registry.all.help = 'all [search]';
  registry.help.help = 'help [command]';
  registry.debug.help = 'debug [level]';
  return Object.freeze({
    log(...args) {
      stdout(...args) && _console.log(...args);
    },
    error(...args) {
      stderr(...args) && _console.error(...args);
    },
    debug(...args) {
      stddbg(...args) && _console.log(...args);
    },
    info(...args) {
      stdnfo(...args) && _console.info(...args);
    },
    register(cmd, callback, help) {
      if (!(cmd in registry)) {
        callback.help = help;
        registry[cmd] = callback;
      } else {
        Console.error('register failed (double registration):', cmd);
      }
    },
    registerGlobal(name, ...types) {
      var _value;
      var define = {get: () => value};
      if (types.length == 1) {
        define.set = function(value) {
          return _value = parse(types[0], value, _value);
        };
      } else {
        _value = types.map(type => null);
        define.set = function(...values) {
          return _value = values.map(function(value, i) {
            return parse(types[i], value, _value[i]);
          });
        };
      }
      Object.defineProperty(Global, name, define);
      this.register(name, function(...values) {
        if (values.length) Global[name] = values;
        return Global[name];
      });
    },
    input(line) {
      if (line.length) {
        inputs.push(line);
        cursor = 0;
        var args = line.split(/[\r\n]+/);
        if (!(args[0] in registry)) {
          return Console.error('unknown command:', args[0]);
        }
        var cmd = args.unshift();
        var tmp = [];
        args = args.reduce((arr, arg) => {
          if (!tmp.length) {
            if (arg[0] == '"' && arg[arg.length - 1] == '"') {
              arr.push(arg.susbtring(1, cur.length - 2));
            } else if (arg[0] == '"') {
              tmp.push(arg.substring(1));
            } else {
              arr.push(arg);
            }
          } else {
            if (arg[arg.length - 1] == '"') {
              tmp.push(arg.substring(0, arg.length - 1));
              arr.push(tmp.join(' '));
              tmp = [];
            } else {
              tmp.push(arg);
            }
          }
        }, []));
        if (tmp.length) {
          args.push(tmp.join(' '));
        }
        return registry[cmd](...args);
      }
    },
    prev() {
      ++cursor;
      if (cursor >= input.length) {
        cursor = input.length;
      }
      return inputs[inputs.length - cursor];
    },
    next() {
      --cursor;
      if (cursor <= 0) {
        cursor = 0;
        return '';
      }
      return inputs[inputs.length - cursor];
    },
    stdout(out) {
      stdout = out;
    },
    stderr(err) {
      stderr = err;
    },
    stddbg(dbg) {
      stddbg = dbg;
    },
    stdnfo(nfo) {
      stdnfo = nfo;
    }
  });
  function parse(type, value, defval) {
    switch (type) {
      case 'bool':
      case 'boolean':
        if (value == 'true' || value == 'yes' || value == 'on') {
          return true;
        } else if (value == 'false' || value == 'no' || value == 'off') {
          return false;
        } else {
          return defval;
        }
      case 'int':
      case 'integer':
      case 'float':
      case 'number':
        if (~value.search(/^[\d]+$/)) {
          return parseInt(value);
        } else if (~value.search(/^[\d]+\.[\d]+$/)) {
          return parseFloat(value);
        } else {
          return defval;
        }
      case 'string':
      default:
        return value;
    }
  }
})();