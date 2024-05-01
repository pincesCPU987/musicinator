// Define the keyboard layout
const qwertyLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
];

// Define the corresponding piano notes
const qwertyNotes = [
  ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'],
  ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4'],
  ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3']
];


// buttons
const editButton = document.getElementById("editButton");
const selectButton = document.getElementById("selectButton");
const eraserButton = document.getElementById("eraserButton");
const selectAllButton = document.getElementById("selectAllButton");
const selectTypeButton = document.getElementById("selectTypeButton");
const saveButton = document.getElementById("saveButton");

// canvas 
var output = document.querySelector("#output");
var ctx = output.getContext("2d");



// audio context
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

//instrument class (duh)
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
      "A": 0,
      "A#": 100,
      "B": 200,
      "C": 300 - 1200,
      "C#": 400 - 1200,
      "D": 500 - 1200,
      "D#": 600 - 1200,
      "E": 700 - 1200,
      "F": 800 - 1200,
      "F#": 900 - 1200,
      "G": 1000 - 1200,
      "G#": 1100 - 1200,
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

// Instruments and their sources
var voice = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/nothing.wav', 'assets/voice/a3.wav', 'assets/voice/a4.wav', 'assets/voice/a5.wav']);
var electricpiano = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/electricpiano/a2.wav', 'assets/electricpiano/a3.wav', 'assets/electricpiano/a4.wav', 'assets/electricpiano/a5.wav', 'assets/electricpiano/a6.wav', 'assets/electricpiano/a7.wav']);
var harpsichord = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/harpsichord/a2.wav', 'assets/harpsichord/a3.wav', 'assets/harpsichord/a4.wav', 'assets/harpsichord/a5.wav', 'assets/harpsichord/a6.wav']);
var grandpiano = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/grandpiano/a2.wav', 'assets/grandpiano/a3.wav', 'assets/grandpiano/a4.wav', 'assets/grandpiano/a5.wav', 'assets/grandpiano/a6.wav', 'assets/grandpiano/a7.wav']);


//load the instruments
async function load() {
  await electricpiano.load();
  await grandpiano.load();
  await harpsichord.load();
  await voice.load();
  console.log('loaded');
}

load();

//test note updater
const note = document.querySelector('#note');
const input = document.querySelector('#noteInput');
const instrumentSelector = document.getElementById('Instrument');

let selectedInstrument;
let noteInput;

setInterval(() => {
  noteInput = input.value;
  note.innerText = noteInput;
}, 1);

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    harpsichord.playNote('G3');
  }
})

//default
selectedInstrument = 'electricpiano';

//instrument autodetect function
function playDetectedInstrument(note) {
  if (selectedInstrument === 'electricpiano') {
    electricpiano.playNote(note);
  } if (selectedInstrument === 'grandpiano') {
    grandpiano.playNote(note);
  } if (selectedInstrument === 'voice') {
    voice.playNote(note);
  } if (selectedInstrument === 'harpsichord') {
    harpsichord.playNote(note);
  }
}

// Create an event listener for key presses
document.addEventListener('keydown', (event) => {
  const key = event.key.toUpperCase(); // Convert to uppercase for consistency

  // Find the corresponding row and column in the layout
  let row = -1;
  let col = -1;
  for (let i = 0; i < qwertyLayout.length; i++) {
    const index = qwertyLayout[i].indexOf(key);
    if (index !== -1) {
      row = i;
      col = index;
      break;
    }
  }

  // Retrieve the note from the qwertyNotes array
  if (row !== -1 && col !== -1) {
    const note = qwertyNotes[row][col];
    playDetectedInstrument(note);
    // You can perform any other action with the note here
  }
});
