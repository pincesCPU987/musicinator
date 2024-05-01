canvas = document.querySelector('#output');
const ctx = canvas.getContext('2d');

// Draw white keys
ctx.fillStyle = 'white';
for (let i = 0; i < 14; i++) {
  ctx.fillRect(i * 30, 0, 30, 200);
}

// Draw black keys
ctx.fillStyle = 'black';
for (let i = 1; i < 14; i += 2) {
  ctx.fillRect(i * 30, 0, 20, 120);
}
