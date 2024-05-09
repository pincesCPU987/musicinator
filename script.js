// Define the keyboard layout
const qwertyLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
];

// Define the corresponding piano notes
const qwertyNotes = [
  ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'F6', 'G6'],
  ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
  ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4']
];

// Array for playing notes on keyboard
let qwertyActive = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

let midiActive = [];

const midiNotes = [
  // C0 to B0 (0-11)
  "C0", "C#0", "D0", "D#0", "E0", "F0", "F#0", "G0", "G#0", "A0", "A#0", "B0",
  // C1 to B1 (12-23)
  "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
  // C2 to B2 (24-35)
  "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
  // C3 to B3 (36-47)
  "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
  // C4 (middle C) - 60
  "C4",
  // C#4 to B4 (49-60)
  "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  // C5 to B5 (61-72)
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
  // C6 to B6 (73-84)
  "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
  // C7 to B7 (85-96)
  "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
  // C8 to B8 (97-108)
  "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8",
  // C9 (highest key) - 127
  "C9",
];

for (var i = 0; i < 128; i++) {
  midiActive.push(0);
}

// buttons
const editButton = document.getElementById("editButton");
const selectButton = document.getElementById("selectButton");
const eraserButton = document.getElementById("eraserButton");
const selectAllButton = document.getElementById("selectAllButton");
const selectTypeButton = document.getElementById("selectTypeButton");
const saveButton = document.getElementById("saveButton");

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

//instrument class
class Instrument {
  constructor(assets, loop) {
    this.assets = assets;
    this.loop = loop;
    this.buffers = [];
  }
  async load() {
    for (var i = 0; i < this.assets.length; i++) {
      var audioFetch = await fetch(this.assets[i]);
      var audioBuffer = await audioFetch.arrayBuffer();
      this.buffers.push(await audioCtx.decodeAudioData(audioBuffer));
    }
  }
  async playNote(note, notemode, data, isMidi) {
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
    var row, col, length;
    if (notemode == 'key') {
      row = data.row;
      col = data.col;
    } else if (notemode == 'length') {
      length = data.length;
    }
    
    // Note is a string like "A4" or "A#5"
    var notename = ((note.indexOf('#') >= 0) ? note.substring(0, 2) : note[0]);
    var octave = ((note.length == 3) ? note[2] : note[1]);

    var detune = detunes[notename];

    var sample = this.buffers[Number(octave)];

    var source = audioCtx.createBufferSource();
    source.buffer = sample;
    source.detune.value = detune;

    var volume = audioCtx.createGain();
    volume.gain.value = 1;
    source.connect(volume);
    volume.connect(audioCtx.destination);
    source.loop = !!this.loop;
    source.start();
    if (isMidi === false) {
      while (qwertyActive[row][col] === 1) {
        await new Promise((rs, rj) => {setTimeout(rs);});
      }
      volume.gain.setValueAtTime(1, audioCtx.currentTime);
      volume.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
      while (volume.gain.value > 0) {
        await new Promise((rs, rj) => {setTimeout(rs);});
      }
      try {
        source.stop();
      } catch(err0r) {}
    } else if (isMidi === true) {
      volume.gain.setValueAtTime(1, audioCtx.currentTime);
      while (midiActive[data.note] === 1) {
        await new Promise((rs, rj) => {setTimeout(rs);});
      }
      volume.gain.setValueAtTime(1, audioCtx.currentTime);
      volume.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
      while (volume.gain.value > 0) {
        await new Promise((rs, rj) => {setTimeout(rs);});
      }
      try {
        source.stop();
      } catch(err0r) {}
    }
  }

}
// Instruments and their sources
var voice = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/nothing.wav', 'assets/voice/a3sus2.wav', 'assets/voice/a4sus2.wav', 'assets/voice/a5sus2.wav'], true);
var electricpiano = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/electricpiano/a2.wav', 'assets/electricpiano/a3.wav', 'assets/electricpiano/a4.wav', 'assets/electricpiano/a5.wav', 'assets/electricpiano/a6.wav', 'assets/electricpiano/a7.wav'], false);
var harpsichord = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/harpsichord/a2.wav', 'assets/harpsichord/a2.wav', 'assets/harpsichord/a3.wav', 'assets/harpsichord/a4.wav', 'assets/harpsichord/a5.wav', 'assets/harpsichord/a6.wav'], false);
var grandpiano = new Instrument(['assets/nothing.wav', 'assets/nothing.wav', 'assets/grandpiano/a2.wav', 'assets/grandpiano/a3.wav', 'assets/grandpiano/a4.wav', 'assets/grandpiano/a5.wav', 'assets/grandpiano/a6.wav', 'assets/grandpiano/a7.wav'], false);

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
// initialize vars
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
function playDetectedInstrument(note, row, col, isMidi) {
  if (selectedInstrument === 'electricpiano') {
    electricpiano.playNote(note, 'key', {row: row, col: col}, isMidi);
  } if (selectedInstrument === 'grandpiano') {
    grandpiano.playNote(note, 'key', {row: row, col: col}, isMidi);
  } if (selectedInstrument === 'voice') {
    voice.playNote(note, 'key', {row: row, col: col}, isMidi);
  } if (selectedInstrument === 'harpsichord') {
    harpsichord.playNote(note, 'key', {row: row, col: col}, isMidi);
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
    if (qwertyActive[row][col] === 0) {
      const note = qwertyNotes[row][col];
      qwertyActive[row][col] = 1;
      playDetectedInstrument(note, row, col, false);
    }
  }
});

/**
 * Parse basic information out of a MIDI message.
 */
function parseMidiMessage(message) {
  return {
    command: message.data[0] >> 4,
    channel: message.data[0] & 0xf,
    note: message.data[1],
    velocity: message.data[2] / 127
  }
}

function onNote(note, velocity) {
  console.log(note, velocity);
  if (velocity > 0) {
    midiActive[note] = 1;
    var sequence = ('C,C#,D,D#,E,F,G,G#,A,A#,B').split(',');
    var octave = Math.floor(note / 12) + 1;
    note = sequence[note % 12] + octave;
    if (selectedInstrument === 'electricpiano') {
      electricpiano.playNote(note, 'key', {note:note}, true);
    } if (selectedInstrument === 'grandpiano') {
      grandpiano.playNote(note, 'key', {note:note}, true);
    } if (selectedInstrument === 'voice') {
      voice.playNote(note, 'key', {note:note}, true);
    } if (selectedInstrument === 'harpsichord') {
      harpsichord.playNote(note, 'key', {note:note}, true);
    }
  } else if (velocity < 0) {
    midiActive[note] = 0;
  }
}
function onPad(pad, velocity) {}
function onPitchBend(value) {}
function onModWheel(value) {}

function handleMidiMessage(message) {

  // Parse the MIDIMessageEvent.
  const {command, channel, note, velocity} = parseMidiMessage(message)

  // Stop command.
  // Negative velocity is an upward release rather than a downward press.
  if (command === 8) {
    if      (channel === 0) onNote(note, -velocity)
    else if (channel === 9) onPad(note, -velocity)
  }

  // Start command.
  else if (command === 9) {
    if      (channel === 0) onNote(note, velocity)
    else if (channel === 9) onPad(note, velocity)
  }

  // Knob command.
  else if (command === 11) {
    if (note === 1) onModWheel(velocity)
  }

  // Pitch bend command.
  else if (command === 14) {
    onPitchBend(velocity)
  }
}
function startLoggingMIDIInput(midiAccess) {
  midiAccess.inputs.forEach((entry) => {
    entry.onmidimessage = handleMidiMessage;
  });
}

navigator.requestMIDIAccess().then((access) => {console.log(access);}).catch((e) => {console.log(e);});

document.addEventListener('keyup', (event) => {
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
    qwertyActive[row][col] = 0;
  }
});

function getMIDINote(callback) {
  navigator.requestMIDIAccess({ sysex: false })
    .then((midiAccess) => {
      const inputs = midiAccess.inputs.values();

      for (const input of inputs) {
        input.onmidimessage = (message) => {
          const data = message.data;
          const command = data[0];
          const note = data[1];

          // Check for "note on" message (command value 144)
          if (command === 144) {
            callback(note); // Return the note value
          }
        };
      }
    })
    .catch((error) => {
      console.error("Error accessing MIDI devices:", error);
    });
}

getMIDINote((note) => {
  console.log("MIDI note pressed:", note);
  if (selectedInstrument === 'electricpiano') {
    electricpiano.playNote(midiNotes[note], 'key', {note:note}, true);
  } if (selectedInstrument === 'grandpiano') {
    grandpiano.playNote(midiNotes[note], 'key', {note:note}, true);
  } if (selectedInstrument === 'voice') {
    voice.playNote(midiNotes[note], 'key', {note:note}, true);
  } if (selectedInstrument === 'harpsichord') {
    harpsichord.playNote(midiNotes[note], 'key', {note:note}, true);
  }
});
