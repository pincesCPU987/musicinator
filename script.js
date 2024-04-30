var output = document.querySelector("#output");
var ctx = output.getContext("2d");



var audioCtx = new AudioContext();

var audioPlay = async (url) => {
	var src = audioCtx.createBufferSource();
	var audioBuffer = await fetch(url)
		.then((res) => res.arrayBuffer())
		.then((ArrayBuffer) => audioCtx.decodeAudioData(ArrayBuffer));

	src.buffer = audioBuffer;

	src.detune.value = 500;

	src.connect(audioCtx.destination);
	src.start();
};

class Instrument {
	constructor(assets) {
		this.assets = assets;
		this.buffers = [];
	}
	async load() {
		for (var i = 0; i < this.assets.length; i++) {
			var audioFetch = await fetch(this.assets[i]);
			var audioBuffer = await audioFetch.arrayBuffer();
			this.buffers.push(await audioCtx.decodeAudioData(audioBuffer));
		}
	}
  playNote(note) {
    var detunes = {
      "A":     0,
      "A#":  100,
      "B":   200,
      "C":   300 - 1200,
      "C#":  400 - 1200, 
      "D":   500 - 1200, 
      "D#":  600 - 1200,
      "E":   700 - 1200, 
      "F":   800 - 1200,
      "F#":  900 - 1200,
      "G":   1000 - 1200,
      "G#":  1100 - 1200,
    }
    // Note is a string like "A4" or "A#5"
    var notename = ((note.indexOf('#') >= 0) ? note.substring(0, 2) : note[0]);
    var octave = ((note.length == 3) ? note[2] : note[1]);
    
    var detune = detunes[notename];
    
    var sample = this.buffers[Number(octave)];
    
    var source = audioCtx.createBufferSource();
    source.buffer = sample;
    source.detune.value = detune; // man i love and hate this ghostwriter
    
    source.connect(audioCtx.destination);
    source.start(); // duh
  }
} // you figure it out imma et pasta now brb go eat you said that 4 times


var voice = new Instrument(['', '', '', 'assets/voice/a3.wav', 'assets/voice/a4.wav', 'assets/voice/a5.wav']);
var electricpiano = new Instrument(['', '', 'assets/electricpiano/a2.wav', 'assets/electricpiano/a3.wav', 'assets/electricpiano/a4.wav', 'assets/electricpiano/a5.wav', 'assets/electricpiano/a6.wav', 'assets/electricpiano/a7.wav']);

async function load() {
  await voice.load();
  await electricpiano.load();
  console.log('loaded');
}
// imma eat pasta brb 10-15 minutes
load();

const note = document.querySelector('#note');
const input = document.querySelector('#noteInput');

let noteInput;
setInterval(() => {
  noteInput = input.value;
  note.innerText = noteInput;
  return noteInput;
}  , 1);

/*
var mousex = 0;
var mousey = 0;

var mousedown = false;

output.onmousemove = (e) => {};
*/
