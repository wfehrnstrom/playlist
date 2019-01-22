function replace_item(existing, newNode, parentN=null){
  parentN = (parentN) ? parentN : document;
  parentN.insertBefore(newNode, existing);
  parentN.removeChild(existing);
}

function createButton(id, className, clickHandler, innerHTML=''){
  let btn = document.createElement('button');
  btn.id = id;
  btn.className = className;
  btn.addEventListener('click', clickHandler);
  btn.innerHTML = innerHTML;
  return btn;
}

function newPageInSequence(seqId){
  return () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      let url = tabs[0].url;
      console.log(url);
      // TODO: Encrypt URL here
      chrome.storage.sync.get("sequenceMap", function(result){
        console.log(JSON.stringify(result));
        let sequenceMap = result.sequenceMap;
        if(sequenceMap){
          if(!sequenceMap.has(seqId)){
            sequenceMap.set(seqId, []);
          }
          let sequence = sequenceMap.get(seqId);
          sequence.push(url);
          sequenceMap.set(seqId, sequence);
          console.log("Sequence insertion complete.");
        }
        else{
          console.error("Sequence Mapping Never Initialized at extension startup.\nUnable to push desired page");
          chrome.storage.sync.set({sequenceMap: new Map()});
        }
      });
    });
  }
}

function createID(length = 10){
  let charstring = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for(let i = 0; i < length; i++){
    let rand_string_index = Math.floor(Math.random() * charstring.length);
    id += charstring[rand_string_index];
  }
  return id;
}


function toggleSequencingButton(sequencing){
  let existingBtn = document.getElementById('sq_btn');
  sequencing = !sequencing;
  let newBtn = createButton('sq_btn', 'btn', function(){
    chrome.storage.local.set({sequencing: sequencing});
  }, (sequencing) ? 'Stop Sequencing Pages' : 'Start Sequencing Pages');
  let buttonArea = document.querySelectorAll('.quick_buttons')[0];
  replace_item(existingBtn, newBtn, buttonArea);
  if(sequencing){
    let id = createID();
    let addToSequenceBtn = createButton('add_to_sq_btn', 'btn', newPageInSequence(id), 'Add this page to sequence');
    buttonArea.appendChild(addToSequenceBtn);
  }
}

chrome.storage.local.get('sequencing', function(result){
  toggleSequencingButton(result.sequencing);
});

chrome.storage.onChanged.addListener(function(changes, namespace){
  for (key in changes){
    if(key == 'sequencing'){
      toggleSequencingButton(changes[key].newValue);
    }
  }
})
