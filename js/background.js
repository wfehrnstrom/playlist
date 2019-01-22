chrome.runtime.onInstalled.addListener(function(){
  chrome.storage.sync.clear(function(){
    chrome.storage.local.set({sequencing: false});
    chrome.storage.sync.set({activeSequence: null});
    chrome.storage.local.clear();
  });
});
