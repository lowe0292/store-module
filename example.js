var RecordService = require('./src/record-service.js');
var CollectionService = require('./src/collection-service.js');
var StorageProviderFirebase = require('./src/storage-provider-firebase.js');

var storageProviderFirebase = new StorageProviderFirebase('https://castle-scott.firebaseio.com/');
function Person () {
  var F = function() {};
  F.prototype = new RecordService(storageProviderFirebase, 'Person');
  return new F();
}
function Car () {
  var F = function() {};
  F.prototype = new RecordService(storageProviderFirebase, 'Car');
  return new F();
}
function Cat () {
  var F = function() {};
  F.prototype = new RecordService(storageProviderFirebase, 'Cat');
  return new F();
}

// Instantiate your business objects
var bday = new Date('May 28, 1990');
var scott = Person();
var dusty = Car();
var fluffy = Cat();
var damien = Cat();
var river = Cat();
var clone;

// store data
scott.update({ name: 'Scott', title: 'CTO', kid: {name: 'Scott Jr', birthday: bday } })
.then(function () {
  return dusty.update({make: 'Chevy', model: 'Monte Carlo'});
})
.then(function () {
  return fluffy.update({name: 'Fluffy', color: 'grey', age: 3});
})
.then(function () {
  return damien.update({name: 'Damien', color: 'black', model: 3});
})
.then(function () {
  return river.update({name: 'River', color: 'grey', model: 3});
})
.then(function () {
  // load some data
  clone = new RecordService(storageProviderFirebase, 'Person', scott.getID());
  clone.hasOne('Car');
  clone.hasMany('Cat');
  return clone.load();
})
.then(function (data) {
  return clone.hasCar(dusty);
})
.then(function () {
  return clone.hasCat(fluffy);
})
.then(function () {
  return clone.hasCat(damien);
})
.then(function () {
  var car = clone.getCar();
  return car.load();
})
.then(function (data) {
  var collection = new CollectionService(storageProviderFirebase, 'Cat');
  collection.query('color', 'grey');
  collection.sync(function (data) { console.log('grey cats:', data); });
})
