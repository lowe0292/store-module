var pluralize = require('pluralize');
var q = require('q');
function toSnakeCase (string) {
  var words = string.split(' ');
  var output = '';
  for (var i = 0; i < words.length; i++) {
    output = output + words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return output;
}
function toCamelCase (string) {
  var snakeCase = toSnakeCase(string);
  return snakeCase.charAt(0).toLowerCase() + snakeCase.slice(1);
}
var CollectionService = function (provider, type) {
  if (!provider) { throw new Error('Provider required'); }
  if (!type) { throw new Error('Type required'); }
  var RecordService = require('./record-service.js'); //required at runtime to avoid circular dependency
  var _provider = provider;
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
  this.query = function (sortBy, equalTo, limit) {
    var service = this;
    service._records = [];
    function resultFound (key) {
      var record = new RecordService(_provider, _type, key);
      service.addRecord(record);
    }
    var type = pluralize(toCamelCase(_type));
    _provider.query(type, sortBy, equalTo, limit, resultFound);
  }
};

module.exports = CollectionService;
