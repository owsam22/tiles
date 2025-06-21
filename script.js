const board = document.getElementById("game-board");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");

const restartBtn = document.getElementById("restart-btn");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const flipsDisplay = document.getElementById("flips");
const turnsDisplay = document.getElementById("turns");
const highScoreDisplay = document.getElementById("high-score");
const postGame = document.getElementById("post-game");
const finalStats = document.getElementById("final-stats");
const muteBtn = document.getElementById("mute-btn");

const flipAudio = document.getElementById("flip-audio");
const matchAudio = document.getElementById("match-audio");
const bgMusic = document.getElementById("bg-music");

let tiles = [], flippedTiles = [];
let matchedCount = 0, timer = 0, flips = 0, turns = 0, score = 0;
let interval, isMuted = false;
let highScore = localStorage.getItem('memoryHighScore') || 0;
highScoreDisplay.textContent = `High Score: ${highScore}`;

const imageUrls = [
  '/images/01.jpg',
  '/images/02.jpg',
  '/images/03.jpg',
  '/images/04.jpg',
  '/images/05.jpg',
  '/images/06.jpg',
  '/images/07.jpg',
  '/images/08.jpg',
  '/images/09.jpg',
  '/images/10.jpg'
];

function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()* (i+1));[a[i],a[j]]=[a[j],a[i]];}}

function startTimer(){
  timer = 0;
  timerDisplay.textContent = `Time: ${timer}s`;
  interval = setInterval(()=>{
    timer++;
    timerDisplay.textContent = `Time: ${timer}s`;
  },1000);
}

function stopTimer(){clearInterval(interval);}

function updateScore(){
  score = Math.max(1000 - timer*10 - flips*2, 0);
  scoreDisplay.textContent = `Score: ${score}`;
}

function endGame(){
  stopTimer();
  updateScore();
  if(score > highScore){
    highScore = score;
    localStorage.setItem('memoryHighScore', highScore);
    highScoreDisplay.textContent = `High Score: ${highScore}`;
  }
  finalStats.textContent = `
    Time: ${timer}s | Flips: ${flips} | Turns: ${turns} | Score: ${score}
  `;
  postGame.classList.remove('hidden');
}



function createTile(url){
  const tile = document.createElement('div');
  tile.classList.add('tile');
  const img = document.createElement('img');
  img.src = url;
  tile.appendChild(img);
  tile.addEventListener('click',()=>flipTile(tile));
  return tile;
}

function flipTile(t){
  if(t.classList.contains('flipped')||t.classList.contains('matched')||flippedTiles.length===2)return;
  
  t.classList.add('flipped');
  flippedTiles.push(t);
  flips++;
  flipsDisplay.textContent = `Flips: ${flips}`;

  if(!isMuted){flipAudio.currentTime=0;flipAudio.play();}
  
  if(flippedTiles.length===2){
    turns++;
    turnsDisplay.textContent = `Turns: ${turns}`;
    const [a,b] = flippedTiles;
    if(a.querySelector('img').src===b.querySelector('img').src){
      a.classList.add('matched'); b.classList.add('matched');
      matchedCount+=2;
      if(!isMuted){matchAudio.currentTime=0;matchAudio.play();}
      flippedTiles=[];
      if(matchedCount===20)endGame();
    } else {
      setTimeout(()=>{
        a.classList.remove('flipped'); b.classList.remove('flipped');
        flippedTiles=[];
      },800);
    }
  }
  updateScore();
}

function init() {
  board.innerHTML = "";
  postGame.classList.add('hidden');
  matchedCount = flips = turns = timer = 0;
  score = 0;
  flipsDisplay.textContent = 'Flips: 0';
  turnsDisplay.textContent = 'Turns: 0';
  scoreDisplay.textContent = 'Score: 0';
  timerDisplay.textContent = 'Time: 0s';

  const imgs = [...imageUrls, ...imageUrls];
  shuffle(imgs);
  tiles = imgs.map(url => createTile(url));
  tiles.forEach(t => board.appendChild(t));
  tiles.forEach(t => t.classList.add('flipped'));
  setTimeout(() => {
    tiles.forEach(t => t.classList.remove('flipped'));
    startTimer();
    if (!isMuted) bgMusic.play();
  }, 3000);
}

function startGame() {
  startBtn.classList.add('hidden');
  stopBtn.classList.remove('hidden');
  init();
}

function stopGame() {
  stopTimer();
  bgMusic.pause();
  board.innerHTML = "";
  postGame.classList.remove('hidden');
  finalStats.textContent = `❌ Game Stopped!`;
  stopBtn.classList.add('hidden');
  startBtn.classList.remove('hidden');
}


startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
restartBtn.addEventListener('click', startGame);
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
  if (isMuted) bgMusic.pause();
  else bgMusic.play();
});
