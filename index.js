var RecordService = require('./src/record-service.js');
var CollectionService = require('./src/collection-service.js');
var StorageProviderFirebase = require('./src/storage-provider-firebase.js');

var storageProviderFirebase = new StorageProviderFirebase('https://castle-scott.firebaseio.com/');
var bday = new Date('May 28, 1990');
var scott = new RecordService(storageProviderFirebase, 'Person');

scott.update({ name: 'Scott', title: 'CTO', kid: {name: 'Scott Jr', birthday: bday } })
.then(function () {
  console.log('Saved!');
  var clone = new RecordService(storageProviderFirebase, 'Person', scott.getID());
  return clone.load();
})
.then(function (data) {
  console.log(data);
})
