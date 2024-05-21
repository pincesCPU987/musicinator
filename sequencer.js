let playing = false;

let sequence = [
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' },
    { 'instrument': 'grandpiano', 'note': 'D2' }
]

function playSequence() {
    while (playing === true) {
        for (let i = 0; i < (sequence.length + 1); i++) {
            playDetectedInstrument(sequence[i].note, null, null, true, true, sequence[i].instrument);
        }
    }
}

setInterval(playSequence, 50);