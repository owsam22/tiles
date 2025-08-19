const board = document.getElementById("game-board");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const restartBtn = document.getElementById("restart-btn");

const flipsDisplay = document.getElementById("flips");
const turnsDisplay = document.getElementById("turns");
const muteBtn = document.getElementById("mute-btn");
const postGame = document.getElementById("post-game");
const finalStats = document.getElementById("final-stats");

const flipAudio = document.getElementById("flip-audio");
const matchAudio = document.getElementById("match-audio");
const bgMusic = document.getElementById("bg-music");

let tiles = [], flippedTiles = [];
let matchedCount = 0, timer = 0, flips = 0, turns = 0;
let interval, isMuted = false, isGameRunning = false;

let level = 1;
let maxFlips = 70;
let retryUsed = false;

const imageUrls = [
  '01.jpg', '02.jpg', '03.jpg','04.jpg','05.jpg','06.jpg','07.jpg','08.jpg','09.jpg','10.jpg'
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function startTimer() {
  timer = 0;
  interval = setInterval(() => timer++, 1000);
}

function stopTimer() {
  clearInterval(interval);
}

function updateStats() {
  const maxTurns = Math.floor(maxFlips / 2);
  const remaining = Math.max(0, maxTurns - turns);
  flipsDisplay.textContent = `Level: ${level}`;
  turnsDisplay.textContent = `Remaining Turns: ${remaining}`;

  if (remaining === 0 && matchedCount < 20) {
    showLossCelebration();
  }
}

function createTile(url) {
  const tile = document.createElement("div");
  tile.classList.add("tile");
  const img = document.createElement("img");
  img.src = url;
  tile.appendChild(img);
  tile.addEventListener("click", () => flipTile(tile));
  return tile;
}

function flipTile(tile) {
  if (!isGameRunning || tile.classList.contains("flipped") || tile.classList.contains("matched") || flippedTiles.length === 2) return;

  tile.classList.add("flipped");
  flippedTiles.push(tile);

  if (!isMuted) {
    flipAudio.currentTime = 0;
    flipAudio.play();
  }

  if (flippedTiles.length === 2) {
    const [a, b] = flippedTiles;
    const isMatch = a.querySelector("img").src === b.querySelector("img").src;

    setTimeout(() => {
      if (isMatch) {
        a.classList.add("matched");
        b.classList.add("matched");
        matchedCount += 2;
        if (!isMuted) matchAudio.play();
        if (matchedCount === 20) {
          showWinCelebration();
        }
      } else {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        turns++; // ✅ Only increase if wrong pair
        updateStats();
      }

      flippedTiles = [];
    }, 700); // Smooth delay to let player see the result
  }
}

function init() {
  board.innerHTML = "";
  matchedCount = flips = turns = 0;
  postGame.classList.add("hidden");

  const images = [...imageUrls, ...imageUrls];
  shuffle(images);
  tiles = images.map(createTile);
  tiles.forEach(tile => board.appendChild(tile));
  tiles.forEach(tile => tile.classList.add("flipped"));

  setTimeout(() => {
    tiles.forEach(tile => tile.classList.remove("flipped"));
    startTimer();
    if (!isMuted) bgMusic.play();
    isGameRunning = true;
    updateStats();
  }, 4000);
}

function startGame() {
  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");
  init();
}

function stopGame() {
  isGameRunning = false;
  stopTimer();
  bgMusic.pause();
  initDefaultTiles(); // Show default tiles on stop

  postGame.classList.remove("hidden");
  finalStats.textContent = "❌ Game Stopped!";
  stopBtn.classList.add("hidden");
  startBtn.classList.remove("hidden");
}

function showWinCelebration() {
  isGameRunning = false;
  stopTimer();
  bgMusic.pause();

  const div = document.createElement("div");
  div.id = "celebration";
  div.innerHTML = `
    <div class="celebration-content">
      🎉 Level ${level} Cleared!
      <br><button onclick="nextLevel()">Next Level</button>
      <button onclick="restartGame()">Play Again</button>
    </div>
  `;
  document.body.appendChild(div);
}

function showLossCelebration() {
  isGameRunning = false;
  stopTimer();
  bgMusic.pause();

  const div = document.createElement("div");
  div.id = "celebration";
  div.innerHTML = `
    <div class="celebration-content">
      ❌ You ran out of turns!
      <br><button onclick="restartGame()">Try Again</button>
    </div>
  `;
  document.body.appendChild(div);
}

function nextLevel() {
  document.getElementById("celebration")?.remove();
  level++;
  maxFlips = Math.max(30, maxFlips - 5);
  retryUsed = false;
  init(); // ✅ Directly init without waiting for user click or reset
}

function restartGame() {
  document.getElementById("celebration")?.remove();
  level = 1;
  maxFlips = 70;
  retryUsed = false;
  init();
}

startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);
restartBtn.addEventListener("click", restartGame);
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? "🔇 Unmute" : "🔊 Mute";
  if (isMuted) bgMusic.pause();
  else if (isGameRunning) bgMusic.play();
});


function initDefaultTiles() {
  board.innerHTML = "";
  const totalTiles = 20; // 4x5 layout

  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
  }
}
initDefaultTiles(); // Show default tiles on load


// Instruction Popup Logic
window.addEventListener("load", () => {
  const box = document.getElementById("instruction-box");
  const closeBtn = document.getElementById("close-instruction");

  // Auto-close after 10 seconds
  const timeout = setTimeout(() => {
    box.style.display = "none";
  }, 10000);

  // Close on X button
  closeBtn.addEventListener("click", () => {
    box.style.display = "none";
    clearTimeout(timeout);
  });
});

