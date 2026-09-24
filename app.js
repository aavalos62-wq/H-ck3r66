const body = document.body;
const themeToggle = document.querySelector('#theme-toggle');
const settingsTheme = document.querySelector('#settings-theme');
const modeLabel = document.querySelector('#mode-label');

function setTheme(light) {
  body.classList.toggle('light', light);
  modeLabel.textContent = light ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  localStorage.setItem('hack-theme', light ? 'light' : 'dark');
}

setTheme(localStorage.getItem('hack-theme') === 'light');
themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('light')));
settingsTheme.addEventListener('click', () => setTheme(!body.classList.contains('light')));

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === button.dataset.view));
  });
});

const gameSeeds = {
  arcade: ['HexGL', 'Subway Surfers', 'Temple Run 2', 'Fireboy and Watergirl', 'Doodle Jump', 'Flappy Bird', 'Crossy Road', 'Jetpack Joyride', 'Fruit Ninja', 'Angry Birds', 'Cut the Rope', 'Hill Climb Racing', 'Geometry Dash', 'Stack', 'Paper.io 2', 'Helix Jump', 'Color Tunnel', 'Drift Boss', 'Stickman Hook', 'Vex 7', 'Action King: Draw Fight', 'Gold Miner', 'Bob the Robber', 'Duck Life', 'Monkey Mart', 'Fireboy and Watergirl 2', 'Red Ball 4', 'Fancy Pants Adventure', 'Super Mario 63', 'Pac-Man', 'Tetris', 'Snake', 'Space Invaders', 'Pinball', 'Asteroids', 'Breakout', 'Sonic Run', 'Mega Man X', 'Kirby Adventure', 'Minesweeper'],
  puzzle: ['2048', 'Sudoku', 'Bubble Shooter', 'Mahjong', 'Cut the Rope', 'Flow Free', 'Block Blast', 'Tangle Master', 'Unblock Me', 'Water Sort', 'Merge Fruit', 'Wood Block Puzzle', 'Nuts and Bolts', 'The Impossible Quiz', 'Brain Test', 'Words of Wonders', 'Wordle', 'Crossword', 'Solitaire', 'FreeCell', 'Chess', 'Checkers', 'Backgammon', 'Mancala', 'Dominoes', 'Connect 4', 'Battleship', 'Memory Match', 'Nonogram', 'Mekorama'],
  action: ['Action Games', 'Getaway Shootout', 'Gun Mayhem 2', 'Bullet Force', 'Shell Shockers', 'Krunker', 'Rooftop Snipers', 'Stickman Fighting', 'Mortal Kombat', 'Ninja Clash Heroes', 'Zombs Royale', 'Bad Ice Cream', 'Vex 6', 'Ragdoll Archers', 'Drunken Duel', 'Superfighters', 'Fireboy Escape', 'Raft Wars', 'Duck Hunt', 'Zombie Mission', 'Stick Merge', 'Boxing Random', 'Soccer Random', 'Basket Random', 'Tennis Masters', 'Masked Forces', 'Strike Force Kitty', 'Hobo', 'Action Turnip', 'Monster Tracks'],
  sports: ['Basketball Stars', 'Football Legends', 'Soccer Skills World Cup', 'Basketball Slam Dunk', 'Volleyball Challenge', 'Tennis Clash', 'Golf Battle', 'Mini Golf World', 'Bowling Stars', 'Table Tennis World Tour', '8 Ball Pool', 'Billiards', 'Drift Hunters', 'Moto X3M', 'Racing Limits', 'Real Cars in City', 'Highway Traffic', 'Bus and Subway', 'Super Bike the Champion', 'Snow Rider 3D', 'Skateboard Hero', 'Rally Point 4', 'Grand City Stunts', 'Monster Truck', 'Parking Fury', 'Winx Bloom Coolgirl', 'Horse Riding Simulator', 'Archery World Tour', 'Stickman Golf', 'Rooftop Run']
};

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const gameGrid = document.querySelector('#game-grid');
const games = Object.entries(gameSeeds).flatMap(([category, names]) => names.map((name) => ({ name, category })));

gameGrid.innerHTML = games.map((game, index) => {
  const art = ['art-rings', 'art-grid', 'art-lines', 'art-cross'][index % 4];
  const icon = ['move-up-right', 'grid-2x2', 'route', 'hash'][index % 4];
  const number = String(index + 1).padStart(3, '0');
  return `<article class="game-card${index === 0 ? ' featured' : ''}" data-category="${game.category}" data-name="${game.name.toLowerCase()} ${game.category}">
    <div class="card-art ${art}"><span>${number}</span><i data-lucide="${icon}"></i></div>
    <div class="card-body"><div><p class="card-type">${game.category.toUpperCase()} / LOCAL</p><h2>${game.name}</h2></div><button class="launch" data-game-index="${index}" type="button" aria-label="Play ${game.name}" title="Play game"><i data-lucide="play"></i></button></div>
  </article>`;
}).join('');

document.querySelector('#library-count').textContent = games.length;
const cards = [...document.querySelectorAll('.game-card')];
const search = document.querySelector('#game-search');
const emptyState = document.querySelector('#empty-state');
let activeFilter = 'all';

const player = document.querySelector('#player');
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const playerTitle = document.querySelector('#player-title');
const playerCategory = document.querySelector('#player-category');
const scoreOutput = document.querySelector('#player-score');
const timeOutput = document.querySelector('#player-time');
const bestOutput = document.querySelector('#player-best');
const playerHelp = document.querySelector('#player-help');
let currentGame;
let gameState;
let gameTimer;
let animationFrame;
const pressedKeys = new Set();

function drawGame() {
  if (!gameState) return;
  const { player: hero, target } = gameState;
  context.fillStyle = body.classList.contains('light') ? '#f2f2ef' : '#171717';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = body.classList.contains('light') ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.08)';
  context.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 45) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
  for (let y = 0; y < canvas.height; y += 45) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }
  context.fillStyle = body.classList.contains('light') ? '#222' : '#d7ff3f';
  context.beginPath(); context.arc(target.x, target.y, 16, 0, Math.PI * 2); context.fill();
  context.fillStyle = body.classList.contains('light') ? '#111' : '#f3f3f0';
  context.fillRect(hero.x - 14, hero.y - 14, 28, 28);
  context.strokeStyle = body.classList.contains('light') ? '#222' : '#d7ff3f';
  context.strokeRect(hero.x - 18, hero.y - 18, 36, 36);
}

function moveGame() {
  if (!gameState || gameState.time <= 0) return;
  const speed = 5;
  if (pressedKeys.has('arrowup') || pressedKeys.has('w')) gameState.player.y -= speed;
  if (pressedKeys.has('arrowdown') || pressedKeys.has('s')) gameState.player.y += speed;
  if (pressedKeys.has('arrowleft') || pressedKeys.has('a')) gameState.player.x -= speed;
  if (pressedKeys.has('arrowright') || pressedKeys.has('d')) gameState.player.x += speed;
  gameState.player.x = Math.max(20, Math.min(canvas.width - 20, gameState.player.x));
  gameState.player.y = Math.max(20, Math.min(canvas.height - 20, gameState.player.y));
  const distance = Math.hypot(gameState.player.x - gameState.target.x, gameState.player.y - gameState.target.y);
  if (distance < 30) {
    gameState.score += 100;
    gameState.target = { x: 35 + Math.random() * (canvas.width - 70), y: 35 + Math.random() * (canvas.height - 70) };
    scoreOutput.textContent = String(gameState.score).padStart(4, '0');
  }
  drawGame();
  animationFrame = requestAnimationFrame(moveGame);
}

function startGame(game) {
  currentGame = game;
  const best = Number(localStorage.getItem(`hack-best-${slugify(game.name)}`) || 0);
  gameState = { score: 0, time: 30, player: { x: canvas.width / 2, y: canvas.height / 2 }, target: { x: 120 + Math.random() * 660, y: 70 + Math.random() * 360 } };
  playerTitle.textContent = game.name;
  playerCategory.textContent = `${game.category.toUpperCase()} / LOCAL`;
  scoreOutput.textContent = '0000';
  timeOutput.textContent = '30';
  bestOutput.textContent = String(best).padStart(4, '0');
  playerHelp.textContent = 'Move with the arrow keys or WASD. Collect the bright targets.';
  clearInterval(gameTimer);
  cancelAnimationFrame(animationFrame);
  gameTimer = setInterval(() => {
    if (!gameState || gameState.time <= 0) return;
    gameState.time -= 1;
    timeOutput.textContent = String(gameState.time).padStart(2, '0');
    if (gameState.time === 0) {
      const finalScore = gameState.score;
      if (finalScore > best) { localStorage.setItem(`hack-best-${slugify(game.name)}`, finalScore); bestOutput.textContent = String(finalScore).padStart(4, '0'); }
      playerHelp.textContent = `Round over. You scored ${finalScore}. Restart for another run.`;
    }
  }, 1000);
  player.hidden = false;
  body.classList.add('player-open');
  drawGame();
  animationFrame = requestAnimationFrame(moveGame);
}

function closeGame() {
  player.hidden = true;
  body.classList.remove('player-open');
  clearInterval(gameTimer);
  cancelAnimationFrame(animationFrame);
  currentGame = null;
  gameState = null;
}

document.querySelectorAll('.launch').forEach((button) => button.addEventListener('click', () => startGame(games[Number(button.dataset.gameIndex)])));
document.querySelector('#close-player').addEventListener('click', closeGame);
document.querySelector('#restart-game').addEventListener('click', () => startGame(currentGame));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !player.hidden) closeGame();
  pressedKeys.add(event.key.toLowerCase());
});
document.addEventListener('keyup', (event) => pressedKeys.delete(event.key.toLowerCase()));
canvas.addEventListener('pointerdown', (event) => {
  if (!gameState) return;
  const bounds = canvas.getBoundingClientRect();
  gameState.player.x = ((event.clientX - bounds.left) / bounds.width) * canvas.width;
  gameState.player.y = ((event.clientY - bounds.top) / bounds.height) * canvas.height;
});

function filterGames() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach((card) => {
    const matches = (activeFilter === 'all' || card.dataset.category === activeFilter) && card.dataset.name.includes(query);
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  emptyState.hidden = visible !== 0;
}

search.addEventListener('input', filterGames);
document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
    filterGames();
  });
});

document.querySelector('#motion-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  button.classList.toggle('on');
  button.setAttribute('aria-pressed', button.classList.contains('on'));
  button.querySelector('b').textContent = button.classList.contains('on') ? 'On' : 'Off';
  body.classList.toggle('no-motion', !button.classList.contains('on'));
});

window.addEventListener('beforeunload', (event) => {
  event.preventDefault();
  event.returnValue = '';
});

lucide.createIcons();