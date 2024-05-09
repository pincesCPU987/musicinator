const audioElement = document.querySelector("#music");
const filterSelect = document.querySelector("#selectedFilter");
let filterChoice, selectedFilter, source, audioCtx, freq, connecterator;

// Function to create a BiquadFilter with the selected type
function createFilter(filterType) {
    audioCtx = audioCtx || new AudioContext();
    const filter = audioCtx.createBiquadFilter();
    switch (filterType) {
        case "lowshelf":
            filter.type = "lowshelf";
            break;
        case "highshelf":
            filter.type = "highshelf";
            break;
        case "peaking":
            filter.type = "peaking";
            break;
        default:
            filter.type = "none";
            break;
    }
    filter.frequency.value = freq;
    filter.gain.value = gain;

    return filter;
}

function playAudio(filterChoice) {
    if (!connecterator) {
        selectedFilter = createFilter(filterChoice);
        source = audioCtx.createMediaElementSource(audioElement);
        source.connect(selectedFilter).connect(audioCtx.destination);
        audioElement.play();
    } else {
        audioElement.pause();
        // Disconnect existing filter and connect the new one
        selectedFilter = createFilter(filterChoice);
        source.connect(selectedFilter).connect(audioCtx.destination);
        audioElement.play();
    }
    let finish = true;
    return finish;
}
