let filterTypes = ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'];

// Create a new AudioContext
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Select the audio element
var audioElement = document.getElementById('music');

// Create a MediaElementAudioSourceNode
// Feed the HTMLMediaElement into it
var source = audioContext.createMediaElementSource(audioElement);

// Create a BiquadFilterNode
var biquadFilter = audioContext.createBiquadFilter();

// Connect the source to the filter, the filter to the destination
source.connect(biquadFilter);
biquadFilter.connect(audioContext.destination);

// Set the Biquad filter type
biquadFilter.type = "lowshelf";


biquadFilter.frequency.value = 500;
biquadFilter.gain.value = 5;