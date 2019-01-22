chrome.runtime.onInstalled.addListener(function(){
  chrome.storage.local.set({sequencing: false}, function(){
    console.log("Sequencing Off");
  });
  let sequenceMap = new Map();
  console.log(sequenceMap.has("hey"));
  chrome.storage.sync.set({sequenceMap: sequenceMap});
});
