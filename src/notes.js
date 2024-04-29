// Structure of a note:      {time: relative time from beginning of measure in beats, note: example 'A5'}
//updated for performance:   [relative time from beginning of measure in beats, note]

var notes = [
	[
		{}
	],
]

var audioCtx = new AudioContext();

// https://stackoverflow.com/questions/30482887/playing-a-simple-sound-with-web-audio-api

var url = '../assets/a4.wav';
// how do we start this
// im gonna do something bad
async function load() {
  var response = await fetch(url);
  var arr = await response.arrayBuffer();

  var audioBuffer = ctx.createBuffer()
}
// im testing something in script.js

audio.onload = (e) => {
  
};

// imma look up how to use audiocontext because
// I'm used to Audio
// we cant tune it without an audiocontext
