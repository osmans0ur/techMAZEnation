const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player logo - load your actual image
const playerImg = new Image();
playerImg.src = "club-logo.png";

// Create fallback logo in case image doesn't load
function createPlayerLogo() {
  const logoCanvas = document.createElement('canvas');
  logoCanvas.width = 30;
  logoCanvas.height = 30;
  const logoCtx = logoCanvas.getContext('2d');
  
  // Draw TechNation-style logo
  const gradient = logoCtx.createLinearGradient(0, 0, 30, 30);
  gradient.addColorStop(0, '#4169E1');
  gradient.addColorStop(1, '#6495ED');
  logoCtx.fillStyle = gradient;
  logoCtx.fillRect(0, 0, 30, 30);
  
  // Add pattern
  logoCtx.fillStyle = '#ffffff';
  logoCtx.fillRect(5, 8, 4, 4);
  logoCtx.fillRect(5, 18, 4, 4);
  logoCtx.fillRect(12, 5, 4, 4);
  logoCtx.fillRect(12, 15, 4, 4);
  logoCtx.fillRect(12, 25, 4, 4);
  logoCtx.fillRect(19, 8, 4, 4);
  logoCtx.fillRect(19, 18, 4, 4);
  
  return logoCanvas;
}

const fallbackLogo = createPlayerLogo();

// 20×20 maze (1 = wall, 0 = path)
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,1],
  [1,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,0,1,0,1,1,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1]
];

// Maze dimensions
const rows = maze.length;
const cols = maze[0].length;
const tileSize = canvas.width / cols;

// Game state
let player = { x: 0, y: 1 };
let prize = { x: cols - 2, y: rows - 1 };
let gameWon = false;
let gameStarted = false;
let animationTime = 0;
let startTime = 0;
let endTime = 0;
let completionTime = 0;

// Game menu elements
const gameMenu = document.getElementById('gameMenu');
const startButton = document.getElementById('startButton');

// Draw maze with neon walls
function drawMaze() {
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "aqua";
  ctx.strokeStyle = "cyan";

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
  ctx.shadowBlur = 0;
}

// Draw player
function drawPlayer() {
  const x = player.x * tileSize + 5;
  const y = player.y * tileSize + 5;
  const size = tileSize - 10;
  
  // Add subtle glow to player
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#4169E1";
  
  // Use your actual image if loaded, otherwise use fallback
  if (playerImg.complete && playerImg.naturalHeight !== 0) {
    ctx.drawImage(playerImg, x, y, size, size);
  } else {
    ctx.drawImage(fallbackLogo, x, y, size, size);
  }
  ctx.shadowBlur = 0;
}

// Draw animated prize
function drawPrize() {
  const px = prize.x * tileSize + tileSize/2;
  const py = prize.y * tileSize + tileSize/2;
  
  // Pulsing animation
  const pulseScale = 1 + Math.sin(animationTime * 0.1) * 0.2;
  
  // Outer glow
  ctx.beginPath();
  ctx.arc(px, py, (tileSize/3) * pulseScale, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 255, 200, 0.3)";
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#00ffff";
  ctx.fill();

  // Inner core
  ctx.fillStyle = "#00ffff";
  ctx.shadowBlur = 12;
  const coreSize = 12 * pulseScale;
  ctx.fillRect(px - coreSize, py - coreSize, coreSize * 2, coreSize * 2);
  ctx.shadowBlur = 0;
  
  // Circuit pattern
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "#ffffff";
  const patternSize = 8 * pulseScale;
  ctx.strokeRect(px - patternSize, py - patternSize, patternSize * 2, patternSize * 2);
  ctx.moveTo(px - patternSize, py);
  ctx.lineTo(px + patternSize, py);
  ctx.moveTo(px, py - patternSize);
  ctx.lineTo(px, py + patternSize);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// Win message with completion time
function drawWinMessage() {
  if (gameWon) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#00ffff";
    ctx.font = "42px Arial";
    ctx.textAlign = "center";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ffff";
    ctx.fillText("🚀 MAZE SOLVED!", canvas.width/2, canvas.height/2 - 80);
    
    ctx.fillStyle = "#00ff00";
    ctx.font = "28px Arial";
    ctx.shadowColor = "#00ff00";
    ctx.fillText(`Time: ${formatTime(completionTime)}`, canvas.width/2, canvas.height/2 - 20);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.shadowColor = "#ffffff";
    ctx.fillText("Press R to restart", canvas.width/2, canvas.height/2 + 40);
    ctx.restore();
  }
}

// Format time as MM:SS
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Start game function
function startGame() {
  gameStarted = true;
  gameWon = false;
  startTime = Date.now();
  player = { x: 0, y: 1 };
  gameMenu.classList.add('hidden');
}

// Show completion menu
function showCompletionMenu() {
  gameMenu.innerHTML = `
    <div class="menu-text menu-title">🚀 Congratulations!</div>
    <div class="completion-time">${formatTime(completionTime)}</div>
    <div class="menu-text menu-subtitle">You solved the TechNation Maze!</div>
    <button id="restartButton" class="menu-button">Play Again</button>
  `;
  gameMenu.classList.remove('hidden');
  
  // Add restart button event
  document.getElementById('restartButton').addEventListener('click', () => {
    gameMenu.innerHTML = `
      <div class="menu-text menu-title">TechNation Maze</div>
      <div class="menu-text menu-subtitle">Navigate through the neon maze to reach the prize!</div>
      <button id="startButton" class="menu-button">Start Game</button>
    `;
    document.getElementById('startButton').addEventListener('click', startGame);
    startGame();
  });
}

// Main game loop
function gameLoop() {
  animationTime++;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Only draw game if started
  if (gameStarted) {
    drawMaze();
    drawPlayer();
    drawPrize();
    drawWinMessage();

    // Check win condition
    if (player.x === prize.x && player.y === prize.y && !gameWon) {
      gameWon = true;
      endTime = Date.now();
      completionTime = endTime - startTime;
      setTimeout(() => {
        showCompletionMenu();
      }, 500); // Small delay to show the win message briefly
    }
  }

  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (!gameStarted || gameWon) return;

  let newX = player.x;
  let newY = player.y;
  
  if (e.key === "ArrowUp") newY--;
  if (e.key === "ArrowDown") newY++;
  if (e.key === "ArrowLeft") newX--;
  if (e.key === "ArrowRight") newX++;

  // Check bounds and walls
  if (newY >= 0 && newY < rows && newX >= 0 && newX < cols && maze[newY][newX] === 0) {
    player.x = newX;
    player.y = newY;
  }
});

// Event listeners
startButton.addEventListener('click', startGame);

// Start the game loop
gameLoop();