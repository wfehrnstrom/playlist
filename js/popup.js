function replace_ui_node(existing, newNode, parentN=null){
  parentN = (parentN) ? parentN : document;
  parentN.insertBefore(newNode, existing);
  parentN.removeChild(existing);
}

function createButton(id, className, clickHandler=null, innerHTML='', as='button'){
  let btn = document.createElement(as);
  btn.id = id;
  btn.className = className;
  if(clickHandler != null){
    btn.addEventListener('click', clickHandler);
  }
  btn.innerHTML = innerHTML;
  return btn;
}

function getKeyValuePairFromString(mapString, index=0){
  if(mapString.indexOf("(", index) != -1 && mapString.indexOf(")", index) != -1){
    let keyValue = {
      key: mapString.substring(mapString.indexOf("(", index)+1, mapString.indexOf(",", index)),
      value: mapString.substring(mapString.indexOf(",", index)+1, mapString.indexOf(")", index))
    }
    return {pair: keyValue, index: mapString.indexOf(")", index) + 1}
  }
  else{
    return {pair: null, index: mapString.length};
  }
}

function decodeMapFromString(mapString){
  let i = 0;
  let map = new Map();
  if(!mapString){
    return map;
  }
  while(i < mapString.length){
    let pairAndIndex = getKeyValuePairFromString(mapString, i);
    if(pairAndIndex.pair){
      map.set(pairAndIndex.pair.key, pairAndIndex.pair.value.split(","));
    }
    i = pairAndIndex.index;
  }
  return map;
}

function encodeStringFromMap(map){
  let string = '';
  for(var [key, value] of map.entries()){
    string += '(' + key + ',' + value + ')';
  }
  return string;
}

function validSeqId(id){
  if(id && id.length == 10){
    return true;
  }
  return false;
}

function newPageInSequence(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    let url = tabs[0].url;
    // TODO: Encrypt URL here
    chrome.storage.sync.get(["sequenceMap", "activeSequence"], function(result){
      let sequenceMap = decodeMapFromString(result.sequenceMap);
      let seqId = result.activeSequence;
      if(!validSeqId(seqId)){
        console.error("Sequence Identifier Invalid. Aborting...");
      }
      if(!sequenceMap.has(seqId)){
        sequenceMap.set(seqId, []);
      }
      let sequence = sequenceMap.get(seqId);
      sequence.push(url);
      sequenceMap.set(seqId, sequence);
      chrome.storage.sync.set({"sequenceMap": encodeStringFromMap(sequenceMap)}, function(){
        createSequenceInPopupUI(seqId, url);
        chrome.storage.sync.get("sequenceMap", function(result){
          console.log(result.sequenceMap);
        });
      });
    });
  });
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

function on_sq_btn_click(sequencing){
  return () => {
    chrome.storage.local.set({sequencing: !sequencing});
    let id = createID();
    if(!sequencing){
      console.log(id);
    }
    chrome.storage.sync.set({activeSequence: !sequencing ? id : null});
  }
}

function changeSequencingButton(){
  chrome.storage.local.get('sequencing', function(result){
    let sequencing = result.sequencing;
    if(sequencing){
      startSequencing();
    }
    else{
      stopSequencing();
    }
  })
}

function startSequencing(){
  showSequencingButtons();
}

// This should be executed every time the popup loads for all sequences
function createSequenceInPopupUI(seqId, startUrl){
  let seqGoBtn = createButton(`seqLink-${seqId}`, 'btn', null, seqId, 'a');
  seqGoBtn.href = startUrl;
  let sequencesAccordion = document.querySelectorAll('.accordion-body')[0];
  sequencesAccordion.appendChild(seqGoBtn);
}

function showSequencingButtons(){
  let buttonArea = document.querySelectorAll('.quick_buttons')[0];
  let stopSeqBtn = createButton('sq_btn', 'btn', on_sq_btn_click(true), 'Stop Sequencing Pages');
  let addToSeqBtn = createButton('add_to_sq_btn', 'btn', newPageInSequence, 'Add this page to sequence');
  let startSeqBtn = document.getElementById('sq_btn');
  buttonArea.appendChild(addToSeqBtn);
  replace_ui_node(startSeqBtn, stopSeqBtn, buttonArea);
}

function stopSequencing(){
  hideSequencingButtons();
}

function hideSequencingButtons(){
  let buttonArea = document.querySelectorAll('.quick_buttons')[0];
  let stopSeqBtn = document.getElementById('sq_btn');
  let startSeqBtn = createButton('sq_btn', 'btn', on_sq_btn_click(false), 'Start Sequencing Pages');
  let addToSeqBtn = document.getElementById('add_to_sq_btn');
  if(addToSeqBtn){
    buttonArea.removeChild(addToSeqBtn);
  }
  replace_ui_node(stopSeqBtn, startSeqBtn, buttonArea);
}

changeSequencingButton();

chrome.storage.onChanged.addListener(function(changes, namespace){
  for (key in changes){
    if(key == 'sequencing'){
      changeSequencingButton();
    }
  }
})
