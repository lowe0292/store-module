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
            // this is a date
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
  }
  this.save = function (collection, data, id) {
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
  }
};

module.exports = StorageProviderFirebase;
