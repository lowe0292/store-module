var RecordService = require('./src/record-service.js');
var CollectionService = require('./src/collection-service.js');
var StorageProviderFirebase = require('./src/storage-provider-firebase.js');

var storageProviderFirebase = new StorageProviderFirebase('https://castle-scott.firebaseio.com/');
var scott = new RecordService({
  provider: storageProviderFirebase,
  type: 'Person',
  data: { name: 'Scott', title: 'CTO' }
});

scott.save()
.then(function () {
  console.log('Saved!');
});
