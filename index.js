var RecordService = require('./src/record-service.js');
var CollectionService = require('./src/collection-service.js');
var StorageProviderFirebase = require('./src/storage-provider-firebase.js');

var storageProviderFirebase = new StorageProviderFirebase('https://castle-scott.firebaseio.com/');
var PersonService = function () { };
PersonService.prototype = new RecordService(storageProviderFirebase, 'Person');
var CarService = function () { };
CarService.prototype = new RecordService(storageProviderFirebase, 'Car');
var CatService = function () { };
CatService.prototype = new RecordService(storageProviderFirebase, 'Cat');

var bday = new Date('May 28, 1990');
var scott = new PersonService();
var dusty = new CarService();
var fluffy = new CatService();
var damien = new CatService();
var river = new CatService();
var clone;

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
.then(function () {
  return clone.getCats().sync(function (data) {
    console.log('cats updated', data);
  });
})
.then(function (data) {
  setTimeout(function () {
    clone.hasCat(river);
  }, 10000);
})
