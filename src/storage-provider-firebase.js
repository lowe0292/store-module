var Firebase = require('firebase');
var q = require('q');
function isDate (object) {
  return Object.prototype.toString.call(object) === '[object Date]'
}
var StorageProviderFirebase = function (url) {
  var _ref = new Firebase(url);
  function convertClientDatesToServerTimes (data) {
    var deferred = q.defer();
    function translateDatesRecursive(obj, path, offset) {
      if (!path) { path = []; }
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (isDate(obj[property])) {
            var time = obj[property].getTime() + offset;
            var src = data;
            if (!data._times) { data._times = {}; }
            var dest = data._times;
            for (var i = 0; i < path.length; i++) {
              src = src[path[i]];
              if (typeof dest[path[i]] === 'undefined') { dest[path[i]] = {}; }
              dest = dest[path[i]];
            }
            delete src[property];
            dest[property] = time;
          } else if (typeof obj[property] === 'object'){
            var currentPath = path.slice(); // copy the path array
            currentPath.push(property);
            translateDatesRecursive(obj[property], currentPath, offset);
          }
        }
      }
      deferred.resolve(data);
    }
    // recurse through the properties
    _ref.child(".info/serverTimeOffset").on('value', function(ss) {
      var offset = ss.val() || 0;
      translateDatesRecursive(data, [], offset);
    });
    return deferred.promise;
  };
  function convertServerTimesToClientDates (data) {
    var deferred = q.defer();
    function translateTimesRecursive(obj, path, offset) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] === 'object'){
            var currentPath = path.slice(0); // copy the path array
            currentPath.push(property);
            translateTimesRecursive(obj[property], currentPath, offset);
          } else {
            var time = new Date(obj[property] - offset);
            var dest = data;
            var src = data._times;
            for (var i = 0; i < path.length; i++) {
              src = src[path[i]];
              if (typeof dest[path[i]] === 'undefined') { dest[path[i]] = {}; }
              dest = dest[path[i]];
            }
            delete src[property];
            dest[property] = time;
          }
        }
      }
      deferred.resolve(data);
    }
    if (data && data._times) {
      // recurse through the properties
      _ref.child(".info/serverTimeOffset").on('value', function(ss) {
        var offset = ss.val() || 0;
        translateTimesRecursive(data._times, [], offset);
        delete data._times;
      });
    } else {
      deferred.resolve(data);
    }
    return deferred.promise;
  };
  this.save = function (collection, id, data) {
    var deferred = q.defer();
    convertClientDatesToServerTimes(data)
    .then(function (convertedData) {
      if (id) { // update
        _ref.child(collection).child(id).set(convertedData, function (err) {
          if (err) { deferred.reject(err); }
          else { deferred.resolve(id); }
        });
      } else { // create
        var newRef = _ref.child(collection).push(convertedData, function (err) {
          if (err) { deferred.reject(err); }
          else { deferred.resolve(newRef.key()); }
        });
      }
    })
    return deferred.promise;
  };
  this.load = function (collection, id) {
    var deferred = q.defer();
    _ref.child(collection).child(id).once('value', function (snapshot) {
      convertServerTimesToClientDates(snapshot.val())
      .then(function (convertedData) {
        deferred.resolve(convertedData);
      });
    });
    return deferred.promise;
  };
  this.sync = function (collection, id, callback) {
    _ref.child(collection).child(id).on('value', function (snapshot) {
      convertServerTimesToClientDates(snapshot.val())
      .then(function (convertedData) {
        callback(convertedData);
      })
    });
    return this.load(collection, id);
  };
  this.unsync = function (collection, id) {
    _ref.child(collection).child(id).off();
  }
};

module.exports = StorageProviderFirebase;
