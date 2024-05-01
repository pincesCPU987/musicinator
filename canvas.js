

const canvas = document.querySelector("#output");
const ctx = canvas.getContext("2d");
const tileSize = 40; // Adjust the tile size as needed

// Initialize grid colors (white initially)
const gridColors = Array.from({ length: canvas.width / tileSize }, () =>
    Array.from({ length: canvas.height / tileSize }, () => "white")
);

// Draw the grid
function drawGrid() {
    for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
            ctx.fillStyle = gridColors[x / tileSize][y / tileSize];
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }
}

// Handle mouse click
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const col = Math.floor(mouseX / tileSize);
    const row = Math.floor(mouseY / tileSize);

    // Toggle color (white to black, or vice versa)
    gridColors[col][row] = gridColors[col][row] === "white" ? "black" : "white";

    drawGrid(); // Redraw the grid
});

// Initial draw
drawGrid();