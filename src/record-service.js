var pluralize = require('pluralize');
function isDate (object) {
  return Object.prototype.toString.call(object) === '[object Date]'
}
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
function cloneProperties (obj) {
  if (obj == null || typeof(obj) != 'object' || isDate(obj)) { return obj; }
  var temp = new obj.constructor();
  for(var key in obj) {
    temp[key] = cloneProperties(obj[key]);
  }
  return temp;
}
var RecordService = function (config) {
  if (!config.provider) { throw new Error('Provider required'); }
  if (!config.type) { throw new Error('Type required'); }
  if (!config.data && !config.id) { throw new Error('Data or ID required'); }
  var _provider = config.provider;
  var _type = toSnakeCase(config.type);
  var _data = config.data;
  var _id = config.id;
  this.getType = function () { return _type; }
  this.save = function () {
    if (!_id) { _data.createdAt = new Date(); }
    _data.lastUpdatedAt = new Date();
    return _provider.save(pluralize(toCamelCase(_type)), cloneProperties(_data), _id)
    .then(function (id) {
      _id = id;
    });
  }
};

module.exports = RecordService;
