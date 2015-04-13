var q = require('q');
function toSnakeCase (string) {
  var words = string.split(' ');
  var output = '';
  for (var i = 0; i < words.length; i++) {
    output = output + words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return output;
}
var CollectionService = function (provider, type) {
  if (!provider) { throw new Error('Provider required'); }
  if (!type) { throw new Error('Type required'); }
  var _type = toSnakeCase(type);
  var _records = [];
  var _sync;
  this.addRecord = function (record) {
    var collection = this;
    if (record.getType() !== _type) { throw new Error('Type mismatch'); }
    if (_sync) {
      record.sync(function () {
        collection.load()
        .then(_sync);
      });
    }
    _records.push(record);
  }
  this.load = function () {
    if (!_records || !_records.length) { throw new Error('Cannot load a collection without records'); }
    var promises = [];
    var collectionData = [];
    for (var i = 0; i < _records.length; i++) {
      promises.push(_records[i].load().then(function (recordData) {
        collectionData.push(recordData);
      }));
    }
    return q.all(promises)
    .then(function () {
      return collectionData;
    });
  }
  this.sync = function (onDataChanged) {
    _sync = onDataChanged;
    var collection = this;
    for (var i = 0; i < _records.length; i++) {
      _records[i].sync(function () {
        collection.load()
        .then(onDataChanged);
      });
    }
    return collection.load();
  }
  this.unsync = function () {
    for (var i = 0; i < _records.length; i++) {
      _records[i].unsync();
    }
    delete this._sync;
  }
  //TODO: Add query(sortBy, equalTo) that returns a subset records in this collection
  //TODO: Add all() that returns all records in this collection
};

module.exports = CollectionService;
