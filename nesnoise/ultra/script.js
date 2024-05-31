/*
  DO NOT touch this file without my permission! It will probably break!
*/

var values = document.querySelector('#values');
values.width = 748;

var loaded = false;

var fps = 0;

function drawText(ctx, text, x, y) {
  for (var a = 0; a < text.length; a++) {
  	var letter = text[a];
    var letterdata = font[letter];
    
    letterdata = letterdata.split(' ');
    
    for (var i = 0; i < letterdata.length; i++) {
    	for (var j = 0; j < letterdata[i].length; j++) {
        if (letterdata[i][j] == '1') {
        	ctx.fillRect(x + ((j + (a * 6)) * 2), y + (i * 2), 2, 2);
        }
      }
    }
  }
}

var audioCtx;

async function load() {
	const response = await fetch("https://pincescpu987.github.io/files/keyboardfont.json");
  const font = await response.json();
  window.font = font;
  loaded = true;
  
  audioCtx = new AudioContext();
  
  var osc;
  
  osc = audioCtx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 440;
  var gain = audioCtx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  channels.push({osc: osc, gain: gain, note: 57, vol: 0});
  osc.start();
  
  osc = audioCtx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 440;
  var gain = audioCtx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  channels.push({osc: osc, gain: gain, note: 57, vol: 0});
  osc.start();
  
  osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 440;
  var gain = audioCtx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  channels.push({osc: osc, gain: gain, note: 57, vol: 0});
  osc.start();
  
  var targetsamplerate = 440;
  var samplerate = audioCtx.sampleRate;
  
  var framecount = Math.round(samplerate / targetsamplerate) * targetsamplerate
  
  var buffer = audioCtx.createBuffer(1, framecount, samplerate);
  
  let data = buffer.getChannelData(0);
  
  var samplelength = Math.floor(samplerate / targetsamplerate);
  
  var currentvalue = 0;
  
  for (var i = 0; i < data.length; i++) {
  	if (i % samplelength == 0) {
    	currentvalue = Math.random();
    }
    data[i] = currentvalue;
  }
  
  osc = audioCtx.createBufferSource();
  osc.buffer = buffer;
  
  var gain = audioCtx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  channels.push({osc: osc, gain: gain, note: 440, vol: 0});
  osc.loop = true;
  osc.start();
  
  
  requestAnimationFrame(update);
}

var mode = 0;

var lasttimestamp = -1;
var currtimestamp = -1;

var fpstimestamp = -1;

function update(timestamp) {
	if (!timestamp) {
  	timestamp = performance.now();
  }
  if (fpstimestamp < 0) {
  	fpstimestamp = timestamp;
  }
  if (lasttimestamp < 0) {
  	lasttimestamp = timestamp;
  }
  currtimestamp = timestamp;
  if (mode) {
  	player();
  } else {
  	editor();
  }
  fps++;
  if (fpstimestamp + 1000 < timestamp) {
  	fpstimestamp = timestamp;
    document.querySelector('#fps').innerText = fps;
    fps = 0;
  }
  setTimeout(update);
}


var songdata = [];

for (var i = 0; i < 60; i++) {
	songdata.push([{note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}, false]);
}

var scrolloffset = 0;
var numvalues = 16;

values.height = (numvalues * 16) + 20;

function editor() {
	var ctx = values.getContext('2d');
  ctx.clearRect(0, 0, values.width, values.height);
  
  
  drawText(ctx, 'SQA', 0, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(120, 0, 2, values.height);
  
  drawText(ctx, 'SQB', 124, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(244, 0, 2, values.height);
  
  drawText(ctx, 'TRI', 248, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(368, 0, 2, values.height);
  
  drawText(ctx, 'FUZ', 372, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(528, 0, 2, values.height);
  
  drawText(ctx, 'OUTPUT', 532, 0);
  
  
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 16, values.width, 2);
  
  drawText(ctx, 'SQA SQB TRI FUZ', 532, 20);
  
  for (var i = scrolloffset; (i < scrolloffset + numvalues) && (i < songdata.length); i++) {
  	for (var j = 0; j < 3; j++) {
      var text = formatSongData(songdata[i][j]);
      
      drawText(ctx, text, j * 124, ((i - scrolloffset) * 16) + 20);
    }
    var text = formatSongData2(songdata[i][3]);
    drawText(ctx, text, 3 * 124, ((i - scrolloffset) * 16) + 20);
  }
  if (!switching && keyspressed.Space) {
  	switching = true;
    mode = 1;
    currentnote = 0;
  } else if (!keyspressed.Space) {
  	switching = false;
  }
}

var logged = false;

function formatSongData(data) {
	var notes = 'C C#D D#E F F#G G#A A#B '.match(/.{2}/g);
  
  var text;
  
  if (data.note != null) {
  	var note = notes[data.note % 12];
    var octave = Math.floor(data.note / 12);

    text = note + octave;
  } else {
  	text = '---';
  }
  
  if (data.vol != null) {
  	text += ' 0x' + data.vol.toString(16).padStart(4, '0').toUpperCase();
  } else {
  	text += ' ------';
  }
  return text;
}

function formatSongData2(data) {
  var text;
  
  if (data.note != null) {
  	text = '0x' + data.note.toString(16).padStart(4, '0').toUpperCase();
  } else {
  	text = '------';
  }
  
  if (data.vol != null) {
  	text += ' 0x' + data.vol.toString(16).padStart(4, '0').toUpperCase();
  } else {
  	text += ' ------';
  }
  return text;
}

var channels = [];

var currentnote = 0;

var switching = false;

function player() {
  if (!keyspressed.Space) {
  	switching = false;
  }
  if (switching) {
    currentnote = 0;
    lasttimestamp = currtimestamp;
    return;
  }
  if (currentnote == 0) {
  	for (var i = 0; i < 3; i++) {
    	channels[i].vol = 0;
      channels[i].note = 57;
    }
  }
  while (currentnote < (((currtimestamp - lasttimestamp) / 1000) * 60)) {
    songdata[currentnote][4] = true;
    for (var i = 0; i < 3; i++) {
    	if (songdata[currentnote][i].vol != null) {
        channels[i].gain.gain.value = songdata[currentnote][i].vol / 0xffff;
        channels[i].vol = songdata[currentnote][i].vol;
      }
      if (songdata[currentnote][i].note != null) {
        channels[i].osc.frequency.value = 13.75 * Math.pow(Math.pow(2, 1/12), songdata[currentnote][i].note + 3);
        channels[i].note = songdata[currentnote][i].note;
      }
    }
    if (songdata[currentnote][3].vol != null) {
    	channels[3].gain.gain.value = songdata[currentnote][3].vol / 0xffff;
      channels[3].vol = songdata[currentnote][3].vol;
    }
    
    if (songdata[currentnote][3].note != null) {
      channels[3].osc.stop();
      channels[3].note = songdata[currentnote][3].note;
            
      var targetsamplerate = channels[3].note;
      var samplerate = audioCtx.sampleRate;

      var framecount = Math.round(samplerate / targetsamplerate) * targetsamplerate

      var buffer = audioCtx.createBuffer(1, framecount, samplerate);

      let data = buffer.getChannelData(0);

      var samplelength = Math.floor(samplerate / targetsamplerate);

      var currentvalue = 0;

      for (var i = 0; i < data.length; i++) {
        if (i % samplelength == 0) {
          currentvalue = Math.random();
        }
        data[i] = currentvalue;
      }

      osc = audioCtx.createBufferSource();
      osc.buffer = buffer;

      osc.connect(channels[3].gain);
      channels[3].osc = osc;
      osc.loop = true;
      osc.start();
    }
    currentnote++;
    
    if (currentnote == songdata.length) {
    	currentnote = 0;
      for (var i = 0; i < songdata.length; i++) {
      	songdata[i][4] = false;
      }
      lasttimestamp = currtimestamp;
    }
  }
  
  var ctx = values.getContext('2d');
  ctx.clearRect(0, 0, values.width, values.height);
  
  
  drawText(ctx, 'SQA', 0, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(120, 0, 2, values.height);
  
  drawText(ctx, 'SQB', 124, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(244, 0, 2, values.height);
  
  drawText(ctx, 'TRI', 248, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(368, 0, 2, values.height);
  
  drawText(ctx, 'FUZ', 372, 0);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(528, 0, 2, values.height);
  
  drawText(ctx, 'OUTPUT', 532, 0);
  
  
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 16, values.width, 2);
  
  drawText(ctx, 'SQA SQB TRI FUZ', 532, 20);
  
  
  
  ctx.fillStyle = '#f00';
  var x = 532;
  drawText(ctx, formatSongData({note: channels[0].note, vol: channels[0].vol}).substring(0, 3), x, 36);
  var y = values.height - ((channels[0].vol * (values.height - 52)) / 0xffff);
  var width = 36;
  var height = ((channels[0].vol / 0xffff) * (values.height - 52));
  ctx.fillRect(x, y, width, height);
  
  ctx.fillStyle = '#0f0';
  var x = 580;
  drawText(ctx, formatSongData({note: channels[1].note, vol: channels[1].vol}).substring(0, 3), x, 36);
  var y = values.height - ((channels[1].vol * (values.height - 52)) / 0xffff);
  var width = 36;
  var height = ((channels[1].vol / 0xffff) * (values.height - 52));
  ctx.fillRect(x, y, width, height);
  
  ctx.fillStyle = '#00f';
  var x = 628;
  drawText(ctx, formatSongData({note: channels[2].note, vol: channels[2].vol}).substring(0, 3), x, 36);
  var y = values.height - ((channels[2].vol * (values.height - 52)) / 0xffff);
  var width = 36;
  var height = ((channels[2].vol / 0xffff) * (values.height - 52));
  ctx.fillRect(x, y, width, height);
  
  ctx.fillStyle = '#fff';
  var x = 676;
  drawText(ctx, formatSongData2({note: channels[3].note, vol: channels[3].vol}).substring(0, 6), x, 36);
  var y = values.height - ((channels[3].vol * (values.height - 52)) / 0xffff);
  var width = 36;
  var height = ((channels[3].vol / 0xffff) * (values.height - 52));
  ctx.fillRect(x, y, width, height);
  
  
  for (var i = scrolloffset; (i < scrolloffset + numvalues) && (i < songdata.length); i++) {
  	for (var j = 0; j < 3; j++) {
      var text = formatSongData(songdata[i][j]);
      
      drawText(ctx, text, j * 124, ((i - scrolloffset) * 16) + 20);
    }
    var text = formatSongData2(songdata[i][3]);
    drawText(ctx, text, 3 * 124, ((i - scrolloffset) * 16) + 20);
  }
  
  if (!switching && keyspressed.Space) {
  	switching = true;
    mode = 0;
    channels[0].gain.gain.value = 0;
    channels[1].gain.gain.value = 0;
    channels[2].gain.gain.value = 0;
    channels[3].gain.gain.value = 0;
  }
}

var keyspressed = {}

onkeydown = (e) => {
	keyspressed[e.code] = true;
}

onkeyup = (e) => {
	keyspressed[e.code] = false;
}

oncontextmenu = (e) => {
	e.preventDefault();
}

onmousedown = (e) => {
	if (!loaded) {
  	load().catch(e => console.log(e.message));
    loaded = true;
    document.querySelector('#start').style.display = 'none';
    values.style.display = 'block';
    document.querySelector('#controls').style.display = 'block';
  } else if (e.button == 2) {
  	if (keyspressed.KeyV) {
    	var channel = Math.floor(mouse.x / 124);
      if (channel < 4 || (channel == 4 && mouse.x % 124 < 36)) {
      	channel = Math.min(channel, 3);
        var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel]) {
          songdata[noteid][channel].vol = null;
        }
      }
    } else if (keyspressed.KeyN) {
    	var channel = Math.floor(mouse.x / 124);
      if (channel < 4 || (channel == 4 && mouse.x % 124 < 36)) {
      	channel = Math.min(channel, 3);
        var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel]) {
          songdata[noteid][channel].note = null;
        }
      }
    } else {
    	var channel = Math.floor(mouse.x / 124);
      if (channel < 4 || (channel == 4 && mouse.x % 124 < 36)) {
      	channel = Math.min(channel, 3);
        var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel]) {
          songdata[noteid][channel].vol = null;
          songdata[noteid][channel].note = null;
        }
      }
    }
  }
}

var mouse = {
	x: 0,
  y: 0,
}

values.onmousemove = (e) => {
	mouse.x = e.offsetX;
  mouse.y = e.offsetY;
  
  document.querySelector('#row').innerText = Math.floor((mouse.y - 20) / 16) + scrolloffset;
}

values.onwheel = (e) => {
	e.preventDefault();
  if (keyspressed.KeyV) {
  	var channel = Math.floor(mouse.x / 124);
    
    if (channel < 4 || (channel == 4 && mouse.x % 124 < 36)) {
      channel = Math.min(channel, 3);
      if (e.deltaY < 0) {
				var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].vol == null) {
          songdata[noteid][channel].vol = 0;
        }
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].vol < 0xffff) {
          if (keyspressed.Digit4) {
            songdata[noteid][channel].vol += 0x1000;
            songdata[noteid][channel].vol = Math.min(0xffff, songdata[noteid][channel].vol);
          } else if (keyspressed.Digit3) {
            songdata[noteid][channel].vol += 0x100;
            songdata[noteid][channel].vol = Math.min(0xffff, songdata[noteid][channel].vol);
          } else if (keyspressed.Digit2) {
          	songdata[noteid][channel].vol += 0x10;
            songdata[noteid][channel].vol = Math.min(0xffff, songdata[noteid][channel].vol);
          } else {
          	songdata[noteid][channel].vol += 0x1;
          }
        }
      } else if (e.deltaY > 0) {
      	var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].vol > 0) {
          if (keyspressed.Digit4) {
            songdata[noteid][channel].vol -= 0x1000;
            songdata[noteid][channel].vol = Math.max(0, songdata[noteid][channel].vol);
          } else if (keyspressed.Digit3) {
            songdata[noteid][channel].vol -= 0x100;
            songdata[noteid][channel].vol = Math.max(0, songdata[noteid][channel].vol);
          } else if (keyspressed.Digit2) {
          	songdata[noteid][channel].vol -= 0x10;
            songdata[noteid][channel].vol = Math.max(0, songdata[noteid][channel].vol);
          } else {
          	songdata[noteid][channel].vol -= 0x1;
          }
        }
      }
    }
  } else if (keyspressed.KeyN) {
  	var channel = Math.floor(mouse.x / 124);
    
    if (channel < 3) {
      if (e.deltaY < 0) {
				var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].note == null) {
          songdata[noteid][channel].note = 0;
        }
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].note < 120) {
          if (e.shiftKey) {
            songdata[noteid][channel].note += 12;
            songdata[noteid][channel].note = Math.min(119, songdata[noteid][channel].note);
          } else {
            songdata[noteid][channel].note += 1;
          }
        }
      } else if (e.deltaY > 0) {
      	var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].note > 0) {
          if (e.shiftKey) {
            songdata[noteid][channel].note -= 12;
            songdata[noteid][channel].note = Math.max(0, songdata[noteid][channel].note);
          } else {
            songdata[noteid][channel].note -= 1;
          }
        }
      }
    } else if (channel == 3 || (channel == 4 && mouse.x % 124 < 36)) {
    	var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
      channel = Math.min(channel, 3);
      if (e.deltaY < 0) {
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].note == null) {
          songdata[noteid][channel].note = 0;
        }
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].note < 0xffff) {
          if (keyspressed.Digit4) {
            songdata[noteid][channel].note += 0x1000;
            songdata[noteid][channel].note = Math.min(0xffff, songdata[noteid][channel].note);
          } else if (keyspressed.Digit3) {
            songdata[noteid][channel].note += 0x100;
            songdata[noteid][channel].note = Math.min(0xffff, songdata[noteid][channel].note);
          } else if (keyspressed.Digit2) {
            songdata[noteid][channel].note += 0x10;
            songdata[noteid][channel].note = Math.min(0xffff, songdata[noteid][channel].note);
          } else {
            songdata[noteid][channel].note += 1;
          }
        }
      } else if (e.deltaY > 0) {
      	var noteid = Math.floor((mouse.y - 20) / 16) + scrolloffset;
        if (songdata[noteid] && songdata[noteid][channel] && songdata[noteid][channel].note > 0) {
          if (keyspressed.Digit4) {
            songdata[noteid][channel].note -= 0x1000;
            songdata[noteid][channel].note = Math.max(0, songdata[noteid][channel].note);
          } else if (keyspressed.Digit3) {
            songdata[noteid][channel].note -= 0x100;
            songdata[noteid][channel].note = Math.max(0, songdata[noteid][channel].note);
          } else if (keyspressed.Digit2) {
            songdata[noteid][channel].note -= 0x10;
            songdata[noteid][channel].note = Math.max(0, songdata[noteid][channel].note);
          } else {
            songdata[noteid][channel].note -= 1;
          }
        }
      }
    }
  } else {
  	if (e.deltaY > 0) {
    	if (scrolloffset < songdata.length - 1) {
      	if (e.shiftKey) {
        	scrolloffset += 16;
          scrolloffset = Math.min(songdata.length, scrolloffset);
        } else {
        	scrolloffset += 1;
        }
      }
    } else if (e.deltaY < 0) {
    	if (scrolloffset > 0) {
      	if (e.shiftKey) {
        	scrolloffset -= 16;
          scrolloffset = Math.max(0, scrolloffset);
        } else {
        	scrolloffset -= 1;
        }
      }
    }
  }
}

document.querySelector('#length').onkeydown = (e) => {
	if (e.code == "Enter") {
  	var length = Number(e.target.value);
    
    if (length < songdata.length) {
    	while (songdata.length > length) {
      	songdata.splice(length, 1);
      }
    } else {
    	while (length > songdata.length) {
      	songdata.push([{note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}]);
      }
    }
  }
}

function getDataString() {
	var text = '';
  
  for (var i = 0; i < songdata.length; i++) {
  	for (var j = 0; j < 4; j++) {
    	if (songdata[i][j].vol == null) {
      	text += 'null';
      } else {
      	text += songdata[i][j].vol.toString(16).padStart(4, '0');
      }
      if (songdata[i][j].note == null) {
      	text += 'null';
      } else {
      	text += songdata[i][j].note.toString(16).padStart(4, '0');
      }
    }
  }
  return text;
}

function setDataString(text) {
  var newdata = [];
  text = text.match(/.{32}/g);
    
  for (var i = 0; i < text.length; i++) {
  	newdata.push([]);
    text[i] = text[i].match(/.{4}/g);
    for (var j = 0; j < 8; j += 2) {
    	newdata[i].push({vol: ((text[i][j] == 'null') ? null : Number('0x' + text[i][j])), note: ((text[i][j + 1] == 'null') ? null : Number('0x' + text[i][j + 1]))})
    }
  }
  songdata = newdata;
}

function downloadString() {
	var text = getDataString();
  
  console.log(text);
  
  var arr = new Uint8Array(text.length);
  for (var i = 0; i < text.length; i++) {
  	arr[i] = text[i].charCodeAt(0);
  }
  
  var blob = new Blob([arr], {type: 'application/octet-stream'});
  var url = URL.createObjectURL(blob);
  
  var a = document.createElement('a');
  a.href = url;
  a.download = 'thing.nesnoiseultra';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(() => {URL.revokeObjectURL(blob)}, 1000);
}

document.querySelector('#upload').onchange = (e) => {
	if (!e.target.files) {
  	return;
  }
  var file = e.target.files[0];
  var fr = new FileReader();
  fr.onload = (e) => {
  	var arr = new Uint8Array(fr.result);
    
    var text = '';
    
    for (var i = 0; i < arr.length; i++) {
    	text += String.fromCharCode(arr[i]);
    }
    
    setDataString(text);
  }
  fr.readAsArrayBuffer(file);
}

var dupopener = document.querySelector('#dupopener');
var duplic8r = document.querySelector('#DUPLIC8R');
var startdup = document.querySelector('#startdup');
var enddup = document.querySelector('#enddup');
var lengthdup = document.querySelector('#lengthdup');
var newdup = document.querySelector('#newdup');
var sqadup = document.querySelector('#sqadup');
var sqbdup = document.querySelector('#sqbdup');
var tridup = document.querySelector('#tridup');
var fuzdup = document.querySelector('#fuzdup');
var duplic8button = document.querySelector('#DUPLIC8');

var dupopened = false;

dupopener.onclick = (e) => {
	dupopened = !dupopened;
  if (dupopened) {
  	duplic8r.style.display = 'block';
    dupopener.value = 'Close DUPLIC8R';
  } else {
  	duplic8r.style.display = 'none';
    dupopener.value = 'Open DUPLIC8R';
  }
}

startdup.oninput = (e) => {
  lengthdup.value = Number(enddup.value) - Number(startdup.value);
}
enddup.oninput = (e) => {
  lengthdup.value = Number(enddup.value) - Number(startdup.value);
}
lengthdup.oninput = (e) => {
  enddup.value = Number(startdup.value) + Number(lengthdup.value);
}
duplic8button.onclick = (e) => {
	for (var i = 0; i < Number(lengthdup.value); i++) {
  	var data = songdata[i];
    
    if (!data) {
    	data = [{note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}, false];
    }
    while (!songdata[i + Number(newdup.value)]) {
    	songdata.push([{note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}, {note: null, vol: null}, false]);
    }
    if (sqadup.checked) {
    	songdata[i + Number(newdup.value)][0].vol = data[0].vol;
      songdata[i + Number(newdup.value)][0].note = data[0].note;
    }
    if (sqbdup.checked) {
    	songdata[i + Number(newdup.value)][1].vol = data[1].vol;
      songdata[i + Number(newdup.value)][1].note = data[1].note;
    }
    if (tridup.checked) {
    	songdata[i + Number(newdup.value)][2].vol = data[2].vol;
      songdata[i + Number(newdup.value)][2].note = data[2].note;
    }
    if (fuzdup.checked) {
    	songdata[i + Number(newdup.value)][3].vol = data[3].vol;
      songdata[i + Number(newdup.value)][3].note = data[3].note;
    }
  }
}
