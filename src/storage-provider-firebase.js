var Firebase = require('firebase');
var q = require('q');

var StorageProviderFirebase = function (url) {
  var _ref = new Firebase(url);
  this.save = function (collection, data, id) {
    var deferred = q.defer();
    if (id) { // update
      _ref.child(collection).child(id).set(data, function (err) {
        if (err) { deferred.reject(err); }
        else { deferred.resolve(id); }
      });
    } else { // create
      var newRef = _ref.child(collection).push(data, function (err) {
        if (err) { deferred.reject(err); }
        else { deferred.resolve(newRef.key()); }
      });
    }
    return deferred.promise;
  }
};

module.exports = StorageProviderFirebase;
