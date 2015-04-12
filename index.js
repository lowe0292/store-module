var RecordService = require('./src/record-service.js');
var CollectionService = require('./src/collection-service.js');
var StorageProviderFirebase = require('./src/storage-provider-firebase.js');

var storageProviderFirebase = new StorageProviderFirebase('https://castle-scott.firebaseio.com/');
var bday = new Date('May 28, 1990');
var scott = new RecordService({
  provider: storageProviderFirebase,
  type: 'Person',
  data: { name: 'Scott', title: 'CTO', kid: {name: 'Scott Jr', birthday: bday } }
});

scott.save()
.then(function () {
  console.log('Saved!');
  setTimeout(function () {
    scott.update({role: 'Dragon'});
  }, 5000);
});
